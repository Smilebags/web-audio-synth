import { BaseProcessor } from './BaseProcessor.js';

class VoltageQuantizerProcessor extends BaseProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0] || [];
    
    for (let i = 0; i < outputChannel.length; i++) {
      const inputValue = inputChannel[i];
      outputChannel[i] = this.quantize(inputValue);
    }

    return true;
  }

  quantize(value: number) {
    return Math.round(value * 12) / 12;
  }
}

registerProcessor('voltage-quantizer-processor', VoltageQuantizerProcessor);
