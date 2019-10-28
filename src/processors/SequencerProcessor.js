class SequencerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isHigh = false;
    this.isResetHigh = false;
    this.isStepHigh = false;
    this.threshold = 0.1;
    this.currentStep = 0;
    this.currentSubtick = 0;
    this.cutoffValue = 0.5;
    this.levels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.port.onmessage = (message) => this.handleMessage(message);
  }

  handleMessage(message) {
    switch(message.data.type) {
      case 'setLevels':
        this.setLevels(message.data.payload);
        break;
      default:
        break;
    }
  }

  setLevels(levels) {
    this.levels = levels;
  }

  subtick() {
    if (this.currentSubtick === 16) {
      this.currentSubtick = 1;
      this.tick();
      return;
    }
    this.currentSubtick += 1;
  }

  get outputValue() {
    return this.levels[this.currentStep];
  }

  tick() {
    this.currentStep = (this.currentStep + 1) % this.levels.length;
    this.port.postMessage({
      type: 'setActiveTick',
      payload: this.currentStep,
    });
  }

  reset() {
    this.currentStep = 0;
    this.currentSubtick = 0;
    this.port.postMessage({
      type: 'setActiveTick',
      payload: 0,
    });
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel.length; i++) {
      const inputValue = inputChannel[i];
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

      // do subtick
      if (this.isHigh === true) {
        this.isHigh = inputValue >= cutoff - this.threshold;
      } else {
        this.isHigh = inputValue >= cutoff + this.threshold;
        if(this.isHigh) {
          this.subtick();
        }
      }

      // do step
      const stepValue = this.getParameterValue(parameters, 'stepTrigger', i);
      if (this.isStepHigh === true) {
        this.isStepHigh = stepValue >= cutoff - this.threshold;
      } else {
        this.isStepHigh = stepValue >= cutoff + this.threshold;
        if(this.isStepHigh) {
          this.tick();
        }
      }

      // set output
      outputChannel[i] = this.outputValue;
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

registerProcessor('sequencer-processor', SequencerProcessor);
