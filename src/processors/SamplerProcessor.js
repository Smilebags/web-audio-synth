class SamplerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferLength = sampleRate * 30;
    this.buffer = new Float32Array(this.bufferLength);
    this.recordingLength = 0;
    this.bufferWriteOffset = 0;
    this.bufferReadOffset = 0;
    this.isWriting = false;
    this.isPlayTriggerHigh = false;
    this.cutoff = 0.5;
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
        this.restartPlay();
      }
      this.isPlayTriggerHigh = currentPlayTriggerIsHigh;

      if (!this.isPlayTriggerHigh) {
        outputChannel[i] = 0;
        continue;
      }
      
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
  
  write(value) {
    this.buffer[this.bufferWriteOffset] = value;
    this.bufferWriteOffset = (this.bufferWriteOffset + 1) % this.bufferLength;
  }

  restartPlay() {
    this.bufferReadOffset = 0;
  }

  read() {
    if (this.readPosition >= this.recordingLength) {
      return 0;
    }
    return this.buffer[this.readPosition];
  }

  advanceReadPosition(amount) {
    this.bufferReadOffset += amount; 
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