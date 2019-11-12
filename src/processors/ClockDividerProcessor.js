class ClockDividerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isHigh = false;
    this.isResetHigh = false;
    this.threshold = 0.1;
    this.currentStep = 63;
    this.isPreStart = true;
    this.cutoffValue = 0.5;
  }

  tick() {
    this.currentStep = (this.currentStep + 1) % 64;
  }

  reset() {
    this.currentStep = 0;
    this.isPreStart = true;
  }

  process(inputs, outputs, parameters) {
    const outputChannel1 = outputs[0][0];
    const outputChannel2 = outputs[1][0];
    const outputChannel3 = outputs[2][0];
    const outputChannel4 = outputs[3][0];
    const outputChannel5 = outputs[4][0];
    const outputChannel6 = outputs[5][0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel1.length; i++) {
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

      // determine tick
      if (this.isHigh === true) {
        this.isHigh = inputValue >= cutoff - this.threshold;
      } else {
        this.isHigh = inputValue >= cutoff + this.threshold;
        if(this.isHigh) {
          this.tick();
        }
      }
      
      // set output
      outputChannel1[i] = this.currentStep % (2 ** 1) === 0;
      outputChannel2[i] = this.currentStep % (2 ** 2) < (2 ** 1);
      outputChannel3[i] = this.currentStep % (2 ** 3) < (2 ** 2);
      outputChannel4[i] = this.currentStep % (2 ** 4) < (2 ** 3);
      outputChannel5[i] = this.currentStep % (2 ** 5) < (2 ** 4);
      outputChannel6[i] = this.currentStep % (2 ** 6) < (2 ** 5);
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
    ]
  }
}

registerProcessor('clock-divider-processor', ClockDividerProcessor);
