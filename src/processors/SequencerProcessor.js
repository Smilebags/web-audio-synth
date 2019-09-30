class SequencerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isHigh = false;
    this.threshold = 0.1;
    this.currentStep = 0;
    this.currentSubtick = 0;
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
    this.port.postMessage({
      type: 'setActiveTick',
      payload: this.currentStep,
    });
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel.length; i++) {
      const cutoff = this.getParameterValue(parameters, 'cutoffValue', i);
      if (this.isHigh === true) {
        this.isHigh = inputChannel[i] >= cutoff - this.threshold;
      } else {
        this.isHigh = inputChannel[i] >= cutoff + this.threshold;
        if(this.isHigh) {
          this.subtick();
        }
      }
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
        defaultValue: 0.5,
        minValue: 1e-5,
      },
    ]
  }
}

registerProcessor('sequencer-processor', SequencerProcessor);
