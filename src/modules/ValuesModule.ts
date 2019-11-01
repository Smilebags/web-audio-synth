import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class ValuesModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  type: string = 'Values';
  valuesNodes: ConstantSourceNode[] = [];

  private mousedownParam: AudioParam | null = null;
  private paramInitialValue: number | null = null;
  private mousedownPos: Vec2 | null = null;

  constructor(context: AudioContext) {
    super();
    this.context = context;
    for (let i = 0; i < 8; i++) {
      const constantSourceNode = this.context.createConstantSource();
      constantSourceNode.offset.value = 0;
      constantSourceNode.start();

      this.valuesNodes.push(constantSourceNode);
      this.addDialPlugAndLabel(
        this.valuesNodes[i],
        this.valuesNodes[i].offset,
        String(i + 1),
        'out',
        () => this.valuesNodes[i].offset.value.toFixed(2),
      );
    }
    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    this.addEventListener('mouseup', () => {this.handleMouseup()});
  }

  handleMousedown(pos: Vec2): void {
    const dialParam = this.getDialParamFromPosition(pos);
    if (!dialParam) {
      return;
    }
    this.mousedownParam = dialParam;
    this.paramInitialValue = dialParam.value;
    this.mousedownPos = pos;
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
    if (this.mousedownParam) {
      this.mousedownParam.value = this.paramInitialValue + (relativeYPos / 2**6 );
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