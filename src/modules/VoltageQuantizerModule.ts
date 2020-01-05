import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class VoltageQuantizerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Quantizer';
  type: string = 'VoltageQuantizer';
  private quantizer: AudioWorkletNode;

  constructor(context: AudioContext) {
    super();

    this.context = context;
    this.quantizer = new AudioWorkletNode(this.context, 'voltage-quantizer-processor');
    this.addPlug(this.quantizer, 'In', 'in', 0);
    this.addPlug(this.quantizer, 'Out', 'out', 1);
  }
}