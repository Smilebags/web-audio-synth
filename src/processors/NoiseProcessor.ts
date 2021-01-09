import { BaseProcessor } from './BaseProcessor.js';

class NoiseProcessor extends BaseProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const output = outputs[0];
    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        outputChannel[i] = 2 * (Math.random() - 0.5);
      }
    }
    return true;
  }
}

registerProcessor('noise-processor', NoiseProcessor);