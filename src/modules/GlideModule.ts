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

    const glideAmount = params.glideAmount || 0;

    this.glideWorklet = new AudioWorkletNode(this.context, 'glide-processor');

    this.addPlug({ param: this.glideWorklet, name: 'In', type: 'in' });

    this.glideAmountParam = this.glideWorklet.parameters.get('glideAmount')!;
    this.glideAmountParam.value = glideAmount;
    this.addDialPlugAndLabel(
      this.glideAmountParam,
      this.glideAmountParam,
      'Amount',
      'in',
      () => this.glideAmountParam.value.toFixed(2),
    );

    this.addPlug({ param: this.glideWorklet, name: 'Out', type: 'out' });

    this.addDefaultEventListeners();
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      glideAmount: this.glideAmountParam.value,
    };
  }
}