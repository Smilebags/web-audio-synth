const BUFFER_LENGTH = 2048;

interface ViewerProcessorMessage {
  type: 'getSamples';
}

class ViewerProcessor extends AudioWorkletProcessor {
  sampleBuffer = new Float32Array(BUFFER_LENGTH);
  sampleHead = 0;

  constructor() {
    super();
    this.port.onmessage = (message) => this.handleMessage(message);
  }

  // @ts-ignore Apparently MessageEvent isn't a generic 🤷‍♂️
  handleMessage(message: MessageEvent<ViewerProcessorMessage>) {
    switch(message.data.type) {
      case 'getSamples':
        this.getSamples();
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

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0] || [];
    for (let i = 0; i < outputChannel.length; i++) {
      this.sample(inputChannel[i] || 0);
    }

    return true;
  }

  sample(newSampleValue: number) {
    this.sampleBuffer[this.sampleHead] = newSampleValue;
    this.sampleHead = (this.sampleHead + 1) % BUFFER_LENGTH;
  }
}

registerProcessor('viewer-processor', ViewerProcessor);
