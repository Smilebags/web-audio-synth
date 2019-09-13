import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class ReverbModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Reverb';
  private reverb: ConvolverNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private mixedOut: GainNode;

  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(
    context: AudioContext,
    {
      mixAmount = 0.2
    }: {
      mixAmount?: number
    }) {
    super();

    this.context = context;
    this.reverb = this.context.createConvolver();
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.mixedOut = this.context.createGain();

    this.reverb.connect(this.wetGain);
    this.wetGain.connect(this.mixedOut);

    this.addPlug(this.reverb, 'In', 'in', 0);
    this.addPlug(this.wetGain, 'Dry/Wet', 'in', 1);
    this.addPlug(this.mixedOut, 'Out', 'out', 2);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialDelay = this.reverb.delayTime.value;
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialDelay) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.reverb.delayTime.value = this.initialDelay + (relativeYPos / 2**6 );
  }

  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }

  toParams(): any {
    return {
      type: this.type,
      gain: this.reverb.delayTime.value,
    };
  }
}