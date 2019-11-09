import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class GlideModule extends AbstractRackModule {
  type: string = 'Glide';

  private glideWorklet: AudioWorkletNode;
  private glideAmountParam: AudioParam;

  private mousedownParam: AudioParam | null = null;
  private paramInitialValue: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private paramValueOffset: number | null = null;

  constructor(private context: AudioContext) {
    super();

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
    };
  }
}