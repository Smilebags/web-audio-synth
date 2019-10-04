class ClockDividerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isHigh = false;
    this.isResetHigh = false;
    this.threshold = 0.1;
    this.currentStep = 0;
    this.cutoffValue = 0.5;
  }

  tick() {
    this.currentStep = (this.currentStep + 1) % 16;
  }

  reset() {
    this.currentStep = 0;
  }

  process(inputs, outputs, parameters) {
    const outputChannel1 = outputs[0][0];
    const outputChannel2 = outputs[1][0];
    const outputChannel3 = outputs[2][0];
    const outputChannel4 = outputs[3][0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel1.length; i++) {
      const inputValue = inputChannel[i];
      // determine tick
      const cutoff = this.cutoffValue;
      if (this.isHigh === true) {
        this.isHigh = inputValue >= cutoff - this.threshold;
      } else {
        this.isHigh = inputValue >= cutoff + this.threshold;
        if(this.isHigh) {
          this.tick();
        }
      }

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
      // set output
      outputChannel1[i] = this.currentStep % 2 === 0;
      outputChannel2[i] = this.currentStep % 4 <= 1;
      outputChannel3[i] = this.currentStep % 8 <= 3;
      outputChannel4[i] = this.currentStep % 16 <= 7;
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
