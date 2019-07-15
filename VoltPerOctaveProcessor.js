class VoltPerOctaveProcessor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return [
      {
        name: 'coarse',
        defaultValue: 0
      },
      {
        name: 'fine',
        defaultValue: 0
      },
    ];
  }

  process(inputs, outputs, params) {
    console.log(this.getInputValue(params.coarse));
    // console.log(params.coarse + ((1 / 12) * params.fine));
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    for (let i = 0; i < outputChannel.length; i++) {
      const octaveOffset = 1;
      const coarseValue = this.getInputValue(params.coarse);
      const fineValue = this.getInputValue(params.fine);
      const inChannelValue = this.getInputValue(inputChannel, i);
      const resultantVoltage = octaveOffset + inChannelValue + coarseValue;
      outputChannel[i] = (2 ** resultantVoltage);
      // console.log(2 ** resultantVoltage);
    }
    return true;
  }

  getInputValue(input, index) {
    if (!input.length) {
      return 0;
    }

    if (input.length === 1) {
      return input[0];
    }

    return input[index];
  }

}

registerProcessor('volt-per-octave-processor', VoltPerOctaveProcessor);
