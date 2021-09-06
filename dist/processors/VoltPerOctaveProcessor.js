import { BaseProcessor } from './BaseProcessor.js';
class VoltPerOctaveProcessor extends BaseProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'coarse',
                defaultValue: 0
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const outputChannel = output[0];
        const input = inputs[0];
        const inputChannel = input[0];
        for (let i = 0; i < outputChannel.length; i++) {
            const octaveOffset = 1;
            const coarseValue = this.getParameterValue(parameters, 'coarse', i);
            const inChannelValue = this.getInputValue(inputChannel, i);
            const resultantVoltage = octaveOffset + inChannelValue + coarseValue;
            outputChannel[i] = (2 ** resultantVoltage);
        }
        return true;
    }
}
registerProcessor('volt-per-octave-processor', VoltPerOctaveProcessor);
