class ThresholdTriggerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.start();
    this.previousWasOver = false;
    this.cooldown = 32;
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

  releaseChangeAmount(releaseValue) {
    return (1 / this.releaseSamples(releaseValue));
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    this.countInChunk = 0;
    
    for (let i = 0; i < inputChannel.length; i++) {
      const currentIsOver = inputChannel[i] >= this.getParameterValue(parameters, 'cutoffValue', i);
      if(currentIsOver && !this.previousWasOver && this.cooldown === 0) {
        this.countInChunk += 1;
        this.port.postMessage({
          i,
          countInChunk: this.countInChunk,
          value: inputChannel[i],
          cutoff: this.getParameterValue(parameters, 'cutoffValue', i),
          currentTime: currentTime + (i / sampleRate),
        });
        this.cooldown = 2 ** 6;
      }
      this.previousWasOver = currentIsOver;
      this.cooldown = Math.max(this.cooldown - 1, 0);
      outputChannel[i] = 0;
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
}

registerProcessor('threshold-trigger-processor', ThresholdTriggerProcessor);
