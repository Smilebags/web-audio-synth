class ChordsProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isResetHigh = false;
    this.isStepHigh = false;
    this.threshold = 0.1;
    this.currentStep = 0;
    this.cutoffValue = 0.5;
    this.channelLevels = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this.port.onmessage = (message) => this.handleMessage(message);
  }

  handleMessage(message) {
    switch(message.data.type) {
      case 'setLevel':
        this.setLevel(message.data.payload);
        break;
      default:
        break;
    }
  }

  setLevel(payload) {
    this.channelLevels[payload.channel][payload.index] = payload.value;
  }

  outputValue(channel) {
    return this.channelLevels[channel][this.currentStep];
  }

  step() {
    this.currentStep = (this.currentStep + 1) % this.channelLevels[0].length;
    this.port.postMessage({
      type: 'setActiveStep',
      payload: this.currentStep,
    });
  }

  reset() {
    this.currentStep = 0;
    this.port.postMessage({
      type: 'setActiveStep',
      payload: 0,
    });
  }

  process(inputs, outputs, parameters) {
    const outputChannel1 = outputs[0][0];
    const outputChannel2 = outputs[1][0];
    const outputChannel3 = outputs[2][0];
    const outputChannel4 = outputs[3][0];
    
    for (let i = 0; i < outputChannel1.length; i++) {
      const cutoff = this.cutoffValue;
      
      // do reset
      const resetValue = this.getParameterValue(parameters, 'resetTrigger', i);
      if (this.isResetHigh === true) {
        this.isResetHigh = resetValue >= cutoff - this.threshold;
      } else {
        this.isResetHigh = resetValue >= cutoff + this.threshold;
        if(this.isResetHigh) {
          this.reset();
        }
      }

      // do step
      const stepValue = this.getParameterValue(parameters, 'stepTrigger', i);
      if (this.isStepHigh === true) {
        this.isStepHigh = stepValue >= cutoff - this.threshold;
      } else {
        this.isStepHigh = stepValue >= cutoff + this.threshold;
        if(this.isStepHigh) {
          this.step();
        }
      }

      // set output
      outputChannel1[i] = this.outputValue(0);
      outputChannel2[i] = this.outputValue(1);
      outputChannel3[i] = this.outputValue(2);
      outputChannel4[i] = this.outputValue(3);
    }

    return true;
  }

  getParameterValue(parameters, parameterName, sampleIndex) {
    if (!parameters[parameterName]) {
      return 0;
    }
    if (parameters[parameterName].length === 1) {
      return parameters[parameterName][0];
    }
    return parameters[parameterName][sampleIndex];
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'resetTrigger',
        defaultValue: 0,
      },
      {
        name: 'stepTrigger',
        defaultValue: 0,
      },
    ]
  }
}

registerProcessor('chords-processor', ChordsProcessor);
