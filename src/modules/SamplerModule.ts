import AbstractRackModule from "./AbstractRackModule.js";

export default class SamplerModule extends AbstractRackModule {
  type: string = 'Sampler';

  private sampler: AudioWorkletNode;
  private recordTriggerParam: AudioParam;
  private playTriggerParam: AudioParam;
  private startPosParam: AudioParam;
  private playbackRateParam: AudioParam;
  private noopGain: GainNode;

  constructor(private context: AudioContext) {
    super();


    this.sampler = new AudioWorkletNode(this.context, 'sampler-processor');

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
}