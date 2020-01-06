import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class ValuesModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  type: string = 'Values';
  valuesNodes: ConstantSourceNode[] = [];

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    const { initialValues = [0, 0, 0, 0, 0, 0, 0, 0] } = params;
    this.context = context;
    for (let i = 0; i < 8; i++) {
      const constantSourceNode = this.context.createConstantSource();
      constantSourceNode.offset.value = initialValues[i];
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

  get valuesAsArray() {
    return this.valuesNodes.map(node => node.offset.value);
  }

  toParams(): Object {
    return {
      type: this.type,
      initialValues: this.valuesAsArray,
    };
  }
}