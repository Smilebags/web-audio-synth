import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class NoiseModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Noise';
  private noise: AudioWorkletNode;

  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.noise = new AudioWorkletNode(this.context, 'noise-processor');
    this.addPlug(this.noise, 'White', 'out');
  }
}