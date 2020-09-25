const BUFFER_LENGTH = 2048;

class ViewerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleBuffer = new Float32Array(BUFFER_LENGTH);
    this.sampleHead = 0;
    this.port.onmessage = (message) => this.handleMessage(message);
  }

  handleMessage(message) {
    switch(message.data.type) {
      case 'getSamples':
        this.getSamples(message.data.payload);
        break;
      default:
        break;
    }
  }

  getSamples() {
    this.port.postMessage({
      type: 'samples',
      payload: {
        buffer: this.sampleBuffer,
        head: this.sampleHead,
    },
    });
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0] || [];
    for (let i = 0; i < outputChannel.length; i++) {
      this.sample(inputChannel[i] || 0);
    }

    return true;
  }

  sample(newSampleValue) {
    this.sampleBuffer[this.sampleHead] = newSampleValue;
    this.sampleHead = (this.sampleHead + 1) % BUFFER_LENGTH;
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

registerProcessor('viewer-processor', ViewerProcessor);
