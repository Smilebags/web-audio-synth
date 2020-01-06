import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class DelayModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Delay';
  private delay: DelayNode;


  constructor(
    context: AudioContext,
    params: {[key: string]: any} = {
      startingDelay: 0.2
    }) {
    super(params);

    this.context = context;
    this.delay = this.context.createDelay();
    this.delay.delayTime.value = params.startingDelay;

    this.addPlug(this.delay, 'In', 'in');
    this.addDialPlugAndLabel(
      this.delay.delayTime,
      this.delay.delayTime,
      'Delay Time',
      'in',
      () => this.delay.delayTime.value.toFixed(2),
    );
    this.addPlug(this.delay, 'Out', 'out');

    this.addDefaultEventListeners();
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      startingDelay: this.delay.delayTime.value,
    };
  }
}