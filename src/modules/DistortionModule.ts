import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class DistortionModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Distortion';
  private distortionAmount: ConstantSourceNode;
  private distortionNode: AudioWorkletNode;


  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    const {distortionAmount = 4 } = params;
    this.context = context;

    this.distortionAmount = this.context.createConstantSource();
    this.distortionAmount.offset.value = distortionAmount;
    this.distortionAmount.start();
    this.distortionNode = new AudioWorkletNode(this.context, 'distortion-processor');
    const distortionIn = this.distortionNode.parameters.get('bInput')!;

    this.distortionAmount.connect(distortionIn);

    this.addPlug({ param: this.distortionNode, name: 'In', type: 'in' });
    this.addDialPlugAndLabel(
      this.distortionAmount.offset,
      this.distortionAmount.offset,
      'Drive',
      'in',
      () => this.distortionAmount.offset.value.toFixed(2),
    );
    this.addPlug({ param: this.distortionNode, name: 'Out', type: 'out' });

    this.addDefaultEventListeners();
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      distortionAmount: this.distortionAmount.offset.value,
    };
  }
}