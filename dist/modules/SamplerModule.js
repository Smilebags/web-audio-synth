import AbstractRackModule from "./AbstractRackModule.js";
import AsyncWorkerPort from "../AsyncWorkerPort.js";
export default class SamplerModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.context = context;
        this.type = 'Sampler';
        this.sampler = new AudioWorkletNode(this.context, 'sampler-processor');
        this.asyncWorkerPort = new AsyncWorkerPort(this.sampler.port);
        if (params.sampleData) {
            this.setSampleData(params.sampleData);
        }
        this.noopGain = this.context.createGain();
        this.noopGain.gain.value = 0;
        this.noopGain.connect(this.context.destination);
        this.sampler.connect(this.noopGain);
        this.addPlug({ param: this.sampler, name: 'In', type: 'in' });
        this.recordTriggerParam = this.sampler.parameters.get('recordTrigger');
        this.addPlug({ param: this.recordTriggerParam, name: 'Record', type: 'in' });
        this.playTriggerParam = this.sampler.parameters.get('playTrigger');
        this.addPlug({ param: this.playTriggerParam, name: 'Play', type: 'in' });
        this.startPosParam = this.sampler.parameters.get('startPosition');
        this.addPlug({ param: this.startPosParam, name: 'Start', type: 'in' });
        this.playbackRateParam = this.sampler.parameters.get('playbackRate');
        this.addPlug({ param: this.playbackRateParam, name: 'Rate', type: 'in' });
        this.addPlug({ param: this.sampler, name: 'Out', type: 'out' });
    }
    async getSampleData() {
        const res = await this.asyncWorkerPort.postMessage({ type: 'getSampleData' });
        return res.payload.join(',');
    }
    async setSampleData(sampleData) {
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
