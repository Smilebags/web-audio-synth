import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util/Vec2Math.js";

export default class DelayModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Delay';
  private delay: DelayNode;


  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    const {delay = 0 } = params;
    this.context = context;
    this.delay = this.context.createDelay();
    this.delay.delayTime.value = delay;

    this.addPlug({ param: this.delay, name: 'In', type: 'in' });
    this.addDialPlugAndLabel(
      this.delay.delayTime,
      this.delay.delayTime,
      'Delay Time',
      'in',
      () => this.delay.delayTime.value.toFixed(2),
    );
    this.addPlug({ param: this.delay, name: 'Out', type: 'out' });

    this.addDefaultEventListeners();
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      delay: this.delay.delayTime.value,
    };
  }
}