import { BaseProcessor } from './BaseProcessor.js';
class DistortionProcessor extends BaseProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'aInput',
                defaultValue: 0
            },
            {
                name: 'bInput',
                defaultValue: 0,
                minValue: 0,
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const input = inputs[0][0];
        const output = outputs[0][0];
        for (let i = 0; i < output.length; i++) {
            const inputValue = this.getInputValue(input, i);
            const distortion = this.getParameterValue(parameters, 'bInput', i);
            const mappedValue = this.map(inputValue, distortion);
            const mappedOne = Math.abs(this.map(1, distortion));
            output[i] = mappedValue / mappedOne;
        }
        return true;
    }
    map(input, distortion) {
        const scaleFactor = (2 ** distortion) - 1;
        const scaled = input * scaleFactor;
        const distortionIsZero = distortion === 0;
        const mappedOutput = scaled / (Math.abs(scaled) + 1);
        return (Number(!distortionIsZero) * mappedOutput) + (Number(distortionIsZero) * input);
    }
}
registerProcessor('distortion-processor', DistortionProcessor);
