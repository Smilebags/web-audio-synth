class SamplerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferLength = sampleRate * 30;
    this.buffer = new Float32Array(this.bufferLength);
    this.recordingLength = 0;
    this.bufferWriteOffset = 0;
    this.bufferReadOffset = 0;
    this.isWriting = false;
    this.cutoff = 0.5;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'startTrigger',
      },
      {
        name: 'stopTrigger',
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


  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    for (let i = 0; i < outputChannel.length; ++i) {
      // start writing if start is high
      if (this.getParameterValue(parameters, 'startTrigger', i) >= this.cutoff) {
        this.startRecording();
      }
      
      // stop writing if stop is high
      if (this.getParameterValue(parameters, 'stopTrigger', i) >= this.cutoff) {
        this.stopRecording();
      }
      
      // write input to buffer
      if(this.isWriting) {
        this.write(inputChannel[i] || 0);
      }
      
      // read buffer to output
      outputChannel[i] = this.read();

      // advance read position
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
  
  write(value) {
    this.buffer[this.bufferWriteOffset] = value;
    this.bufferWriteOffset = (this.bufferWriteOffset + 1) % this.bufferLength;
  }

  read() {
    return this.buffer[this.readPosition];
  }

  advanceReadPosition(amount) {
    this.bufferReadOffset = (this.bufferReadOffset + amount) % this.recordingLength; 
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

registerProcessor('sampler-processor', SamplerProcessor);