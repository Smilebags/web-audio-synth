import AbstractRackModule from "./AbstractRackModule.js";

export default class GlideModule extends AbstractRackModule {
  type: string = 'Glide';

  private glideWorklet: AudioWorkletNode;
  private glideAmountParam: AudioParam;

  constructor(private context: AudioContext) {
    super();

    this.glideWorklet = new AudioWorkletNode(this.context, 'glide-processor');

    this.addPlug(this.glideWorklet, 'In', 'in');

    this.glideAmountParam = this.glideWorklet.parameters.get('glideAmount')!;
    this.addPlug(this.glideAmountParam, 'Amount', 'in');

    this.addPlug(this.glideWorklet, 'Out', 'out');
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}