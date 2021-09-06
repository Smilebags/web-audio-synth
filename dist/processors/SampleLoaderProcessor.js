import { BaseProcessor } from './BaseProcessor.js';
class SampleLoaderProcessor extends BaseProcessor {
    constructor() {
        super();
        this.bufferLength = 0;
        this.buffer = new Float32Array(this.bufferLength);
        this.playheadPosition = 0;
        this.isWriting = false;
        this.playTriggerIsHigh = false;
        this.cutoff = 0.5;
        this.port.onmessage = (message) => this.handleMessage(message);
    }
    handleMessage(message) {
        let responseBody;
        switch (message.data.body.type) {
            case 'getSampleData':
                responseBody = {
                    type: 'sampleData',
                    payload: this.getSampleData(),
                };
                break;
            case 'setSampleData':
                responseBody = this.setSampleData(message.data.body.payload);
                break;
            default:
                break;
        }
        this.port.postMessage({
            messageId: message.data.messageId,
            body: responseBody,
        });
    }
    getSampleData() {
        return this.buffer;
    }
    setSampleData(payload) {
        if (payload instanceof Float32Array) {
            this.buffer = payload;
        }
        else {
            this.buffer = new Float32Array(payload);
        }
        this.bufferLength = this.buffer.length;
        return null;
    }
    static get parameterDescriptors() {
        return [
            { name: 'playTrigger' },
            {
                name: 'startPosition',
                defaultValue: 0,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'playbackRate',
                defaultValue: 1,
                minValue: -100,
                maxValue: 100,
            },
        ];
    }
    readPosition(startPosition) {
        return Math.floor((startPosition * this.bufferLength) + this.playheadPosition);
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const outputChannel = output[0];
        for (let i = 0; i < outputChannel.length; ++i) {
            const currentPlayTrigger = this.getParameterValue(parameters, 'playTrigger', i);
            const currentPlayTriggerIsHigh = currentPlayTrigger >= this.cutoff;
            if (!this.playTriggerIsHigh && currentPlayTriggerIsHigh) {
                this.restartPlay();
            }
            this.playTriggerIsHigh = currentPlayTriggerIsHigh;
            if (currentPlayTriggerIsHigh) {
                const startPos = this.getParameterValue(parameters, 'startPosition', i);
                outputChannel[i] = this.read(startPos);
            }
            else {
                outputChannel[i] = 0;
            }
            const playbackRate = this.getParameterValue(parameters, 'playbackRate', i);
            this.advancePlayhead(playbackRate);
        }
        return true;
    }
    restartPlay() {
        this.playheadPosition = 0;
    }
    read(startPosition) {
        const readIndex = this.readPosition(startPosition);
        if (readIndex >= this.bufferLength) {
            return 0;
        }
        return this.buffer[readIndex];
    }
    advancePlayhead(amount) {
        this.playheadPosition += amount;
    }
}
registerProcessor('sample-loader-processor', SampleLoaderProcessor);
