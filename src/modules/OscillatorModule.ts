import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Osc';
  private osc: OscillatorNode;
  private vo: AudioWorkletNode;

  private initialFreq: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(context: AudioContext, type: OscillatorType = 'sine', startingFrequency: number = 440) {
    super();

    this.context = context;
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = startingFrequency;
    this.osc.type = type;
    this.osc.start();
    this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
    this.vo.connect(this.osc.frequency);

    this.addPlug(this.vo, 'V/O In', 'in', 0);
    this.addPlug(this.osc, 'Out', 'out', 2);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialFreq = this.osc.frequency.value;
  }
  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialFreq) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.osc.frequency.value = this.initialFreq + (relativeYPos * 2 );
  }
  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }
}