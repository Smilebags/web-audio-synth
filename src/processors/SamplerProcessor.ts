import { BaseProcessor } from './BaseProcessor.js';

export type SamplerProcessorMessage = GetSampleDataMessage | SetSampleDataMessage;

interface GetSampleDataMessage {
  type: 'getSampleData';
  messageId: number;
}

interface SetSampleDataMessage {
  type: 'setSampleData';
  payload: number[] | Float32Array;
}

class SamplerProcessor extends BaseProcessor {
  bufferLength = sampleRate * 30;
  buffer = new Float32Array(this.bufferLength);
  recordingLength = 0;
  bufferWriteOffset = 0;
  bufferReadOffset = 0;
  isWriting = false;
  isPlayTriggerHigh = false;
  cutoff = 0.5;

  constructor() {
    super();
    this.port.onmessage = (message) => this.handleMessage(message);
  }

  // @ts-ignore Apparently MessageEvent isn't a generic 🤷‍♂️
  handleMessage(message: MessageEvent<SamplerProcessorMessage>) {
    switch(message.data.type) {
      case 'getSampleData':
        this.getSampleData(message.data.messageId);
        break;
      case 'setSampleData':
        this.setSampleData(message.data.payload);
        break;
      default:
        break;
    }
  }

  getSampleData(messageId: number) {
    const recordedSection = this.buffer.slice(this.recordingLength);
    this.port.postMessage({
      messageId: messageId,
      body: {
        type: 'sampleData',
        payload: this.buffer,
      },
    });
  }

  setSampleData(payload: Float32Array | number[]) {
    if (payload instanceof Float32Array) {
      this.buffer = payload;
    } else {
      this.buffer = new Float32Array(payload);
    }
    this.recordingLength = this.buffer.length;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'recordTrigger',
      },
      {
        name: 'playTrigger',
      },
      {
        name: 'startPosition',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
      },
      {
        name: 'playbackRate',
        defaultValue: 0,
        minValue: 0,
        maxValue: 100,
      },
    ]
  }

  get readPosition() {
    return Math.floor(this.bufferReadOffset);
  }


  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel.length; ++i) {
      if (this.getParameterValue(parameters, 'recordTrigger', i) >= this.cutoff) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
      
      if(this.isWriting) {
        this.write(inputChannel[i] || 0);
      }

      const currentPlayTrigger = this.getParameterValue(parameters, 'playTrigger', i);
      const currentPlayTriggerIsHigh = currentPlayTrigger >= this.cutoff;
      if (!this.isPlayTriggerHigh && currentPlayTriggerIsHigh) {
        const startPos = this.getParameterValue(parameters, 'startPosition', i)
        this.restartPlay(startPos);
      }
      this.isPlayTriggerHigh = currentPlayTriggerIsHigh;
      
      outputChannel[i] = this.read();

      const playbackRate = this.getParameterValue(parameters, 'playbackRate', i);
      if(playbackRate !== 0) {
        this.advanceReadPosition(playbackRate);
      }
    }
    return true;
  }

  startRecording() {
    if (this.isWriting) {
      return;
    }
    this.isWriting = true;
    this.recordingLength = 0;
    this.bufferWriteOffset = 0;
  }

  stopRecording() {
    if (!this.isWriting) {
      return;
    }
    this.isWriting = false;
    this.recordingLength = this.bufferWriteOffset;
  }

  write(value: number) {
    this.buffer[this.bufferWriteOffset] = value;
    this.bufferWriteOffset = (this.bufferWriteOffset + 1) % this.bufferLength;
  }

  restartPlay(startPos: number) {
    this.bufferReadOffset = Math.floor(this.recordingLength * startPos);
  }

  read() {
    if (this.readPosition >= this.recordingLength) {
      return 0;
    }
    return this.buffer[this.readPosition];
  }

  advanceReadPosition(amount: number) {
    this.bufferReadOffset += amount; 
  }
}

registerProcessor('sampler-processor', SamplerProcessor);
