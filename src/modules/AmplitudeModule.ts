import AbstractRackModule from "./AbstractRackModule.js";

export default class AmplitudeModule extends AbstractRackModule {
  type: string = 'Amplitude';

  private amplitudeWorklet: AudioWorkletNode;

  constructor(
    private context: AudioContext,
    params: any,  
  ) {
    super(params);

    this.amplitudeWorklet = new AudioWorkletNode(this.context, 'amplitude-processor');

    this.addPlug({ param: this.amplitudeWorklet, name: 'In', type: 'in' });
    this.addPlug({ param: this.amplitudeWorklet, name: 'Out', type: 'out' });

    this.addDefaultEventListeners();
  }
}