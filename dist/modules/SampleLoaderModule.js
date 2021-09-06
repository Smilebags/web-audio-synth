import AbstractRackModule from "./AbstractRackModule.js";
import AsyncWorkerPort from "../AsyncWorkerPort.js";
export default class SampleLoaderModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.context = context;
        this.type = 'SampleLoader';
        this.sampler = new AudioWorkletNode(this.context, 'sample-loader-processor');
        this.asyncWorkerPort = new AsyncWorkerPort(this.sampler.port);
        if (params.sampleData) {
            this.setSampleData(params.sampleData);
        }
        this.playTriggerParam = this.sampler.parameters.get('playTrigger');
        this.addPlug({ param: this.playTriggerParam, name: 'Play', type: 'in' });
        this.startPosParam = this.sampler.parameters.get('startPosition');
        this.addPlug({ param: this.startPosParam, name: 'Start', type: 'in' });
        this.playbackRateParam = this.sampler.parameters.get('playbackRate');
        this.addPlug({ param: this.playbackRateParam, name: 'Rate', type: 'in' });
        this.addPlug({ param: this.sampler, name: 'Out', type: 'out' });
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
    }
    handleMousedown(e) {
        this.loadFileFromDisk();
    }
    async loadFileFromDisk() {
        const buffer = await loadAudioFileToBuffer(this.context);
        await this.setSampleData(buffer);
    }
    async getSampleData() {
        const res = await this.asyncWorkerPort.postMessage({ type: 'getSampleData' });
        return res.payload.join(',');
    }
    async setSampleData(sampleData) {
        if (sampleData instanceof Float32Array) {
            return this.asyncWorkerPort.postMessage({ type: 'setSampleData', payload: sampleData });
        }
        const buffer = new Float32Array(sampleData
            .split(',')
            .map(Number));
        await this.asyncWorkerPort.postMessage({ type: 'setSampleData', payload: buffer });
    }
    async toParams() {
        return {
            ...super.toParams(),
            sampleData: await this.getSampleData(),
        };
    }
}
function loadFile() {
    return new Promise((resolve, reject) => {
        const inputEl = document.createElement('input');
        inputEl.type = 'file';
        inputEl.accept = 'audio/*';
        inputEl.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                return reject();
            }
            const reader = new FileReader();
            reader.addEventListener('load', (e) => {
                var contents = e.target?.result;
                if (!contents || typeof contents === 'string') {
                    return reject();
                }
                resolve(contents);
            });
            reader.readAsArrayBuffer(file);
        });
        inputEl.click();
    });
}
async function loadAudioFileToBuffer(ctx) {
    const fileBuffer = await loadFile();
    const audioBuffer = await ctx.decodeAudioData(fileBuffer);
    return audioBuffer.getChannelData(0);
}
