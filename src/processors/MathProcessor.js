class MathProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'aInput',
        defaultValue: 0
      },
      {
        name: 'bInput',
        defaultValue: 0
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const addChannel = outputs[0][0];
    const subtractChannel = outputs[1][0];
    const multiplyChannel = outputs[2][0];
    const divideChannel = outputs[3][0];
    const modChannel = outputs[4][0];
    
    for (let i = 0; i < addChannel.length; i++) {
      const a = this.getParameterValue(parameters, 'aInput', i);
      const b = this.getParameterValue(parameters, 'bInput', i);

      // set output
      addChannel[i] = a + b;
      subtractChannel[i] = a - b;
      multiplyChannel[i] = a * b;
      divideChannel[i] = a / b;
      modChannel[i] = a % b;
    }
    if (currentFrame % 10000 === 0) {
      const a = this.getParameterValue(parameters, 'aInput', 0);
      const b = this.getParameterValue(parameters, 'bInput', 0);
      console.log(`
      a: ${a}
      b: ${b}
      add: ${addChannel[0]}
      subtract: ${subtractChannel[0]}
      multiply: ${multiplyChannel[0]}
      divide: ${divideChannel[0]}
      mod: ${modChannel[0]}
      `);
    }

    return true;
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

registerProcessor('math-processor', MathProcessor);
