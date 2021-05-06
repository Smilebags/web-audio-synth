import { BaseProcessor } from './BaseProcessor.js';

interface SamplerProcessorMessage {
  messageId: number;
  body: GetSampleDataMessage | SetSampleDataMessage;
}

interface GetSampleDataMessage {
  type: 'getSampleData';
}

interface SetSampleDataMessage {
  type: 'setSampleData';
  payload: number[] | Float32Array;
}

class SampleLoaderProcessor extends BaseProcessor {
  bufferLength = 0;
  buffer = new Float32Array(this.bufferLength);
  playheadPosition = 0;
  isWriting = false;
  playTriggerIsHigh = false;
  cutoff = 0.5;

  constructor() {
    super();
    this.port.onmessage = (message) => this.handleMessage(message);
  }

  handleMessage(message: MessageEvent<SamplerProcessorMessage>) {
    let responseBody;
    switch(message.data.body.type) {
      case 'getSampleData':
        responseBody = {
          type: 'sampleData',
          payload: this.getSampleData(),
        };
        break;
      case 'setSampleData':
        responseBody = this.setSampleData(message.data.body.payload);
        break;
      default:
        break;
    }
    this.port.postMessage({
      messageId: message.data.messageId,
      body: responseBody,
    });
  }

  getSampleData() {
    return this.buffer;
  }

  setSampleData(payload: Float32Array | number[]) {
    if (payload instanceof Float32Array) {
      this.buffer = payload;
    } else {
      this.buffer = new Float32Array(payload);
    }
    this.bufferLength = this.buffer.length;
    return null;
  }

  static get parameterDescriptors() {
    return [
      { name: 'playTrigger' },
      {
        name: 'startPosition',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
      },
      {
        name: 'playbackRate',
        defaultValue: 1,
        minValue: -100,
        maxValue: 100,
      },
    ]
  }

  readPosition(startPosition: number) {
    return Math.floor((startPosition * this.bufferLength) + this.playheadPosition);
  }


  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    
    for (let i = 0; i < outputChannel.length; ++i) {
      const currentPlayTrigger = this.getParameterValue(parameters, 'playTrigger', i);
      const currentPlayTriggerIsHigh = currentPlayTrigger >= this.cutoff;
      if (!this.playTriggerIsHigh && currentPlayTriggerIsHigh) {
        this.restartPlay();
      }
      this.playTriggerIsHigh = currentPlayTriggerIsHigh;
      
      if(currentPlayTriggerIsHigh) {
        const startPos = this.getParameterValue(parameters, 'startPosition', i)
        outputChannel[i] = this.read(startPos);
      } else {
        outputChannel[i] = 0;
      }

      const playbackRate = this.getParameterValue(parameters, 'playbackRate', i);
      this.advancePlayhead(playbackRate);
    }
    return true;
  }

  restartPlay() {
    this.playheadPosition = 0;
  }

  read(startPosition: number) {
    const readIndex = this.readPosition(startPosition);
    if (readIndex >= this.bufferLength) {
      return 0;
    }
    return this.buffer[readIndex];
  }

  advancePlayhead(amount: number) {
    this.playheadPosition += amount; 
  }
}

registerProcessor('sample-loader-processor', SampleLoaderProcessor);
