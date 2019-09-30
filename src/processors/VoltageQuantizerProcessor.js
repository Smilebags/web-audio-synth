class VoltageQuantizerProcessor extends AudioWorkletProcessor {
  quantize(value) {
    return Math.round(value * 12) / 12;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    
    for (let i = 0; i < outputChannel.length; i++) {
      const inputValue = inputChannel[i];
      outputChannel[i] = this.quantize(inputValue);
    }

    return true;
  }
}

registerProcessor('voltage-quantizer-processor', VoltageQuantizerProcessor);
