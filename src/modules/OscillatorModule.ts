import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Osc';
  private osc: OscillatorNode;
  private vo: AudioWorkletNode;
  private voCoarseParam?: AudioParam;
  private voltageOffset: number;

  private initialVoltage: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(
    context: AudioContext,
    {
      oscType = 'sine',
      voltageOffset = Math.log2(440),
    }: {
      oscType?: OscillatorType,
      voltageOffset?: number,
    }) {
    super();

    this.context = context;
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = 0;
    this.osc.type = oscType;
    this.osc.start();
    this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
    this.vo.connect(this.osc.frequency);

    this.voltageOffset = voltageOffset;

    this.voCoarseParam = this.vo.parameters.get('coarse');
    if (this.voCoarseParam) {
      this.voCoarseParam.value = this.voltageOffset;
      this.addPlug(this.voCoarseParam, 'V/O In', 'in', 0);
    }

    this.addPlug(this.osc, 'Out', 'out', 2);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialVoltage = this.voltageOffset;
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialVoltage) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.voltageOffset = this.initialVoltage + (relativeYPos / 2**6 );
    if (this.voCoarseParam) {
      this.voCoarseParam.value = this.voltageOffset;
    }   
  }

  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }

  toParams(): any {
    return {
      type: this.type,
      oscType: this.osc.type,
      voltageOffset: this.voltageOffset,
    };
  }
}