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

  private mousedownParam: AudioParam | null = null;
  private paramInitialValue: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private paramValueOffset: number | null = null;

  constructor(
    context: AudioContext,
    {
      startingDelay = 0.2
    }: {
      startingDelay?: number
    }) {
    super();

    this.context = context;
    this.delay = this.context.createDelay();
    this.delay.delayTime.value = startingDelay;

    this.addPlug(this.delay, 'In', 'in');
    this.addDialPlugAndLabel(
      this.delay.delayTime,
      this.delay.delayTime,
      'Delay Time',
      'in',
      () => this.delay.delayTime.value.toFixed(2),
    );
    this.addPlug(this.delay, 'Out', 'out');

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    this.addEventListener('mouseup', () => {this.handleMouseup()});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    const param = this.getDialParamFromPosition(mousedownEvent);
    if (!param) {
      return;
    }
    this.mousedownParam = param;
    this.mousedownPos = mousedownEvent;
    this.paramInitialValue = param.value;
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    if (
      this.mousedownPos === null
      || this.mousedownParam === null
      || this.paramInitialValue === null
    ) {
      return;
    }
    const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
    this.paramValueOffset = this.paramInitialValue + (relativeYPos / 2**6 );
    if (this.mousedownParam) {
      this.mousedownParam.value = this.paramValueOffset;
    } 
  }

  handleMouseup(): void {
    this.mousedownParam = null;
    this.paramInitialValue = null;
    this.mousedownPos = null;
  }

  toParams(): any {
    return {
      type: this.type,
      startingDelay: this.delay.delayTime.value,
    };
  }
}