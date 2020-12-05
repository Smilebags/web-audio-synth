import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class NoiseModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Noise';
  private noise: AudioWorkletNode;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    this.context = context;
    this.noise = new AudioWorkletNode(this.context, 'noise-processor');
    this.addPlug({ param: this.noise, name: 'White', type: 'out' });
  }
}