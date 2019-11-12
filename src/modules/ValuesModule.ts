import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class ValuesModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  type: string = 'Values';
  valuesNodes: ConstantSourceNode[] = [];

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

    this.addDefaultEventListeners();
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}