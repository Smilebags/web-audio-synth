import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract, isSet } from "../util.js";

export default class EnvelopeModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Envelope';
  private envelope: AudioWorkletNode;
  private envelopeAttackParam: AudioParam;
  private envelopeDecayParam: AudioParam;
  private envelopeSustainParam: AudioParam;
  private envelopeReleaseParam: AudioParam;
  private mousedownPos: Vec2 | null = null;
  private paramMousedownValue: number | null = null;

  constructor(
    context: AudioContext,
    {
      a = 0.01,
      d = 0.2,
      s = 1,
      r = 0.2,
    } : {
      a?: number,
      d?: number,
      s?: number,
      r?: number,
    }
  ) {
    super();

    this.context = context;
    this.envelope = new AudioWorkletNode(this.context, 'envelope-generator-processor');

    this.envelopeAttackParam = this.envelope.parameters.get('a')!;
    this.envelopeAttackParam.value = a;
    this.addPlug(this.envelopeAttackParam, 'A', 'in', 1);

    this.envelopeDecayParam = this.envelope.parameters.get('d')!;
    this.envelopeDecayParam.value = d;
    this.addPlug(this.envelopeDecayParam, 'D', 'in', 2);

    this.envelopeSustainParam = this.envelope.parameters.get('s')!;
    this.envelopeSustainParam.value = s;
    this.addPlug(this.envelopeSustainParam, 'S', 'in', 3);

    this.envelopeReleaseParam = this.envelope.parameters.get('r')!;
    this.envelopeReleaseParam.value = r;
    this.addPlug(this.envelopeReleaseParam, 'R', 'in', 4);
    
    this.addPlug(this.envelope, 'Trigger', 'in', 0);
    this.addPlug(this.envelope, 'Out', 'out', 5);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }
  
  handleMousedown(mousedownEvent: Vec2): void {
    const paramUnderMouse = this.getParamByPosition(mousedownEvent);
    if (!paramUnderMouse) {
      this.mousedownPos = null;
      this.paramMousedownValue = null;
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.paramMousedownValue = paramUnderMouse.value;
  }
  
  handleMousemove(mousemoveEvent: Vec2): void {
    if (!this.mousedownPos) {
      return;
    }
    const paramToUpdate = this.getParamByPosition(this.mousedownPos);
    if (!paramToUpdate) {
      return;
    }
    const changeAmount = (this.mousedownPos.y - mousemoveEvent.y) / 100;
    if (this.paramMousedownValue === null || this.paramMousedownValue === undefined) {
      return;
    }
    paramToUpdate.value = Math.max(this.paramMousedownValue + changeAmount, 0);
  }

  getParamByPosition(position: Vec2): AudioParam | null | undefined {
    if (position.y < 70) {
      return null;
    }
    if (position.y < 120) {
      return this.envelopeAttackParam;
    }
    if (position.y < 170) {
      return this.envelopeDecayParam;
    }
    if (position.y < 220) {
      return this.envelopeSustainParam;
    }
    if (position.y < 270) {
      return this.envelopeReleaseParam;
    }

    return null;
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.save();
    renderContext.fillStyle = '#ffffff';
    renderContext.font = "16px Arial";
    const a = this.envelopeAttackParam && this.envelopeAttackParam.value || 0;
    const d = this.envelopeDecayParam && this.envelopeDecayParam.value || 0;
    const s = this.envelopeSustainParam && this.envelopeSustainParam.value || 0;
    const r = this.envelopeReleaseParam && this.envelopeReleaseParam.value || 0;
    renderContext.fillText(String(a.toFixed(2)), 5, 105);
    renderContext.fillText(String(d.toFixed(2)), 5, 155);
    renderContext.fillText(String(s.toFixed(2)), 5, 205);
    renderContext.fillText(String(r.toFixed(2)), 5, 255);
    renderContext.restore();
    super.render(renderContext);
  }

  toParams(): any {
    return {
      type: this.type,
      a: this.envelopeAttackParam.value,
      d: this.envelopeDecayParam.value,
      s: this.envelopeSustainParam.value,
      r: this.envelopeReleaseParam.value,
    }
  }
}
