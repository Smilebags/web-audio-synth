"use strict";
class OutputMonitorProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.start();
        this.stateBuffer = new SharedArrayBuffer(1);
        this.stateArr = new Int8Array(this.stateBuffer);
        this.port.postMessage({
            type: 'stateBufferTransfer',
            data: this.stateBuffer
        });
    }
    static get parameterDescriptors() {
        return [
            {
                name: 'cutoffValue',
                defaultValue: 0.8,
                minValue: 1e-5,
            },
        ];
    }
    releaseChangeAmount(releaseValue) {
        return (1 / this.releaseSamples(releaseValue));
    }
    process(inputs, outputs, parameters) {
        this.stateBuffer[0] = currentTime;
        const output = outputs[0];
        const outputChannel = output[0];
        if (!this.audioBuffer) {
            this.audioBuffer = new SharedArrayBuffer(128);
            this.audioArr = new Int32Array(this.audioBuffer);
            this.port.postMessage({
                type: 'audioBufferTransfer',
                data: this.audioBuffer,
            });
        }
        const input = inputs[0];
        const inputChannel = input[0];
        this.countInChunk = 0;
        for (let i = 0; i < inputChannel.length; i++) {
            this.audioArr[0] = currentTime;
            // this.outValues[i] = currentTime;//inputChannel[i];
            outputChannel[i] = 0;
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
registerProcessor('output-monitor-processor', OutputMonitorProcessor);
