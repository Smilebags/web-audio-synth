export abstract class BaseProcessor extends AudioWorkletProcessor {
  abstract process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters): boolean;

  getParameterValue(parameters: AudioWorkletParameters, parameterName: string, sampleIndex: number) {
    if (!parameters[parameterName]) {
      return 0;
    }
    if (parameters[parameterName].length === 1) {
      return parameters[parameterName][0];
    }
    return parameters[parameterName][sampleIndex];
  }

  getInputValue(input: Float32Array, index: number) {
    if (!input || !input.length) {
      return 0;
    }
    if (input.length === 1) {
      return input[0];
    }
    return input[index];
  }
}
