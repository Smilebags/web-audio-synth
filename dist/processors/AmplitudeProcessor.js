import { BaseProcessor } from './BaseProcessor.js';
class AmplitudeProcessor extends BaseProcessor {
    constructor() {
        super(...arguments);
        this.amplitude = 0;
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const outputChannel = output[0];
        const input = inputs[0];
        const inputChannel = input[0] || [];
        for (let i = 0; i < outputChannel.length; ++i) {
            const currentAmplitude = Math.abs(inputChannel[i]) || 0;
            this.amplitude = Math.max(currentAmplitude, this.amplitude - 0.01);
            outputChannel[i] = this.amplitude;
        }
        return true;
    }
}
registerProcessor('amplitude-processor', AmplitudeProcessor);
