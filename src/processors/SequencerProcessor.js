class SequencerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.cooldown = 0;
    this.currentStep = 0;
    this.currentSubtick = 0;
    this.levels = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
  }

  subtick() {
    if (this.currentSubtick === 15) {
      this.currentSubtick = 0;
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
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel.length; i++) {
      const currentIsOver = inputChannel[i] >= this.getParameterValue(parameters, 'cutoffValue', i);
      if(currentIsOver && !this.previousWasOver && this.cooldown === 0) {
        this.subtick();
        this.cooldown = 2 ** 6;
      }
      this.previousWasOver = currentIsOver;
      this.cooldown = Math.max(this.cooldown - 1, 0);
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
        name: 'cutoffValue',
        defaultValue: 0.8,
        minValue: 1e-5,
      },
    ]
  }
}

registerProcessor('sequencer-processor', SequencerProcessor);
