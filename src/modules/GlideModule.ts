import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class GlideModule extends AbstractRackModule {
  type: string = 'Glide';

  private glideWorklet: AudioWorkletNode;
  private glideAmountParam: AudioParam;

  constructor(
    private context: AudioContext,
    params: any,  
  ) {
    super(params);

    this.glideWorklet = new AudioWorkletNode(this.context, 'glide-processor');

    this.addPlug(this.glideWorklet, 'In', 'in');

    this.glideAmountParam = this.glideWorklet.parameters.get('glideAmount')!;
    this.addDialPlugAndLabel(
      this.glideAmountParam,
      this.glideAmountParam,
      'Amount',
      'in',
      () => this.glideAmountParam.value.toFixed(2),
    );

    this.addPlug(this.glideWorklet, 'Out', 'out');

    this.addDefaultEventListeners();
  }
}