import { BaseProcessor } from './BaseProcessor.js';

function lerp(a: number, b: number, mix: number) {
  return (a * (1 - mix)) + (b * mix);
}

class GlideProcessor extends BaseProcessor {
  outputValue = 0;

  static get parameterDescriptors() {
    return [
      {
        name: 'glideAmount',
        minValue: 0,
      },
    ];
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0] || [];
    for (let i = 0; i < outputChannel.length; ++i) {
      const glideAmount = this.getParameterValue(parameters, 'glideAmount', i) * sampleRate;
      const glideLerpFactor = 1 / (glideAmount + 1);
      this.outputValue = lerp(this.outputValue, inputChannel[i], glideLerpFactor);
      outputChannel[i] = this.outputValue;
    }
    return true;
  }
}

registerProcessor('glide-processor', GlideProcessor);
