class VoltPerOctaveProcessor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return [
      {
        name: 'coarse',
        defaultValue: 0
      },
    ];
  }

  process(inputs, outputs, params) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    for (let i = 0; i < outputChannel.length; i++) {
      const octaveOffset = 1;
      const coarseValue = this.getParameterValue(params, 'coarse', i);
      const inChannelValue = this.getInputValue(inputChannel, i);
      const resultantVoltage = octaveOffset + inChannelValue + coarseValue;
      outputChannel[i] = (2 ** resultantVoltage);
    }
    return true;
  }

  getInputValue(input, index) {
    if (!input) {
      return 0;
    }

    if (!input.length) {
      return 0;
    }

    if (input.length === 1) {
      return input[0];
    }

    return input[index];
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

registerProcessor('volt-per-octave-processor', VoltPerOctaveProcessor);
