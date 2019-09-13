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
  private initialDelay = 0;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(context: AudioContext, startingDelay: number = 0.2) {
    super();

    this.context = context;
    this.delay = this.context.createDelay();
    this.delay.delayTime.value = startingDelay;

    this.addPlug(this.delay, 'In', 'in', 0);
    this.addPlug(this.delay.delayTime, 'Delay Time', 'in', 1);
    this.addPlug(this.delay, 'Out', 'out', 2);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialDelay = this.delay.delayTime.value;
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialDelay) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.delay.delayTime.value = this.initialDelay + (relativeYPos / 2**6 );
  }

  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }
}