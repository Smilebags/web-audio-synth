import { BaseProcessor } from './BaseProcessor.js';

class MathProcessor extends BaseProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'a',
        defaultValue: 0
      },
      {
        name: 'b',
        defaultValue: 0
      },
    ];
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const subtractChannel = outputs[0][0];
    const multiplyChannel = outputs[1][0];
    const divideChannel = outputs[2][0];
    const modChannel = outputs[3][0];
    
    for (let i = 0; i < outputs[0][0].length; i++) {
      const a = this.getParameterValue(parameters, 'a', i);
      const b = this.getParameterValue(parameters, 'b', i);

      subtractChannel[i] = a - b;
      multiplyChannel[i] = a * b;
      divideChannel[i] = a / b;
      modChannel[i] = a % b;
    }

    return true;
  }
}

registerProcessor('math-processor', MathProcessor);
