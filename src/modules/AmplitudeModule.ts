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

    this.addPlug(this.amplitudeWorklet, 'In', 'in');
    this.addPlug(this.amplitudeWorklet, 'Out', 'out');

    this.addDefaultEventListeners();
  }
}