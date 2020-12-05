import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class VoltageQuantizerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Quantizer';
  type: string = 'VoltageQuantizer';
  private quantizer: AudioWorkletNode;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    this.context = context;
    this.quantizer = new AudioWorkletNode(this.context, 'voltage-quantizer-processor');
    this.addPlug({ param: this.quantizer, name: 'In', type: 'in', order: 0 });
    this.addPlug({ param: this.quantizer, name: 'Out', type: 'out', order: 1 });

    this.addDefaultEventListeners();
  }
}