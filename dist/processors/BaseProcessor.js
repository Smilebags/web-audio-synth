export class BaseProcessor extends AudioWorkletProcessor {
    getParameterValue(parameters, parameterName, sampleIndex) {
        if (!parameters[parameterName]) {
            return 0;
        }
        if (parameters[parameterName].length === 1) {
            return parameters[parameterName][0];
        }
        return parameters[parameterName][sampleIndex];
    }
    getInputValue(input, index) {
        if (!input || !input.length) {
            return 0;
        }
        if (input.length === 1) {
            return input[0];
        }
        return input[index];
    }
}
