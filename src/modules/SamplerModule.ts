import AbstractRackModule from "./AbstractRackModule.js";
import AsyncWorkerPort from "../AsyncWorkerPort.js";

export default class SamplerModule extends AbstractRackModule {
  type: string = 'Sampler';

  private sampler: AudioWorkletNode;
  private recordTriggerParam: AudioParam;
  private playTriggerParam: AudioParam;
  private startPosParam: AudioParam;
  private playbackRateParam: AudioParam;
  private noopGain: GainNode;
  private asyncWorkerPort: AsyncWorkerPort;

  constructor(
    private context: AudioContext,
    params: any,
  ) {
    super(params);

    this.sampler = new AudioWorkletNode(this.context, 'sampler-processor');
    this.asyncWorkerPort = new AsyncWorkerPort(this.sampler.port);
    if (params.sampleData) {
      this.setSampleData(params.sampleData);
    }

    this.noopGain = this.context.createGain();
    this.noopGain.gain.value = 0;
    this.noopGain.connect(this.context.destination);
    this.sampler.connect(this.noopGain);

    this.addPlug(this.sampler, 'In', 'in');

    this.recordTriggerParam = this.sampler.parameters.get('recordTrigger')!;
    this.addPlug(this.recordTriggerParam, 'Record', 'in');
    this.playTriggerParam = this.sampler.parameters.get('playTrigger')!;
    this.addPlug(this.playTriggerParam, 'Play', 'in');
    this.startPosParam = this.sampler.parameters.get('startPosition')!;
    this.addPlug(this.startPosParam, 'Start', 'in');
    this.playbackRateParam = this.sampler.parameters.get('playbackRate')!;
    this.addPlug(this.playbackRateParam, 'Rate', 'in');
    
    this.addPlug(this.sampler, 'Out', 'out');
  }

  private async getSampleData(): Promise<string> {
    const res = await this.asyncWorkerPort.postMessage<{payload: Float32Array}>({ type: 'getSampleData' });
    return res.payload.join(',');
  }

  private async setSampleData(sampleData: string) {
    const buffer = new Float32Array(sampleData
      .split(',')
      .map(Number));
    await this.asyncWorkerPort.postMessage({ type: 'setSampleData', payload: buffer });
  }

  async toParams(): Promise<Object> {
    return {
      ...super.toParams(),
      sampleData: await this.getSampleData(),
    };
  }
}