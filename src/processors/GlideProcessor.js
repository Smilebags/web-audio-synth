function lerp(a, b, mix) {
    return (a * (1 - mix)) + (b * mix);
}

class GlideProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.outputValue = 0;
    }
    static get parameterDescriptors() {
      return [
        {
          name: 'glideAmount',
          minValue: 0,
        },
      ]
    }  
  
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const outputChannel = output[0];
      const input = inputs[0];
      const inputChannel = input[0];
      
      for (let i = 0; i < outputChannel.length; ++i) {
        const glideAmount = this.getParameterValue(parameters, 'glideAmount', i) * sampleRate;
        const glideLerpFactor = 1 / (glideAmount + 1);
        this.outputValue = lerp(this.outputValue, inputChannel[i], glideLerpFactor);
        outputChannel[i] = this.outputValue;
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
  
  registerProcessor('glide-processor', GlideProcessor);