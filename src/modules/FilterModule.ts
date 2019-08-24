import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class FilterModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Filter';
  private biquad: BiquadFilterNode;
  private vo: AudioWorkletNode;
  
  private initialFreq: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(context: AudioContext, type: BiquadFilterType = 'lowpass', startingFrequency: number = 440) {
    super();

    this.context = context;
    this.biquad = this.context.createBiquadFilter();
    this.biquad.frequency.value = startingFrequency;
    this.biquad.type = type;
    this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
    this.vo.connect(this.biquad.frequency);

    this.addPlug(this.biquad, 'In', 'in', 0);
    this.addPlug(this.vo, 'V/O In', 'in', 1);
    this.addPlug(this.biquad, 'Out', 'out', 2);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialFreq = this.biquad.frequency.value;
  }
  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialFreq) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.biquad.frequency.value = this.initialFreq + (relativeYPos * 2 );
  }
  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }
}