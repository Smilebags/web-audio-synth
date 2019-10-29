import AbstractRackModule from "./AbstractRackModule.js";

export default class LooperModule extends AbstractRackModule {
  type: string = 'Looper';

  private sampler: AudioWorkletNode;
  private startTriggerParam: AudioParam;
  private stopTriggerParam: AudioParam;
  private playbackRateParam: AudioParam;

  constructor(private context: AudioContext) {
    super();


    this.sampler = new AudioWorkletNode(this.context, 'sampler-processor');

    this.addPlug(this.sampler, 'In', 'in');

    this.startTriggerParam = this.sampler.parameters.get('startTrigger')!;
    this.addPlug(this.startTriggerParam, 'Start', 'in');
    this.stopTriggerParam = this.sampler.parameters.get('stopTrigger')!;
    this.addPlug(this.stopTriggerParam, 'Stop', 'in');
    this.playbackRateParam = this.sampler.parameters.get('playbackRate')!;
    this.addPlug(this.playbackRateParam, 'Playback', 'in');
    
    this.addPlug(this.sampler, 'Out', 'out');
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}