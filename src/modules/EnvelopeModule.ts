import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

export default class EnvelopeModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Envelope';
  private envelope: AudioWorkletNode;
  private envelopeAttackParam?: AudioParam;
  private envelopeDecayParam?: AudioParam;
  private envelopeSustainParam?: AudioParam;
  private envelopeReleaseParam?: AudioParam;
  private mousedownPos: Vec2 | null = null;
  private paramMousedownValue: number | null = null;

  constructor(
    context: AudioContext,
    a: number = 0.01,
    d: number = 0.2,
    s: number = 1,
    r: number = 0.21,
  ) {
    super();

    this.context = context;
    this.envelope = new AudioWorkletNode(this.context, 'envelope-generator-processor');

    this.envelopeAttackParam = this.envelope.parameters.get('a');
    if (this.envelopeAttackParam) {
      this.envelopeAttackParam.value = a;
      this.addPlug(this.envelopeAttackParam, 'A', 'in', 1);
    }
    this.envelopeDecayParam = this.envelope.parameters.get('d');
    if (this.envelopeDecayParam) {
      this.envelopeDecayParam.value = d;
      this.addPlug(this.envelopeDecayParam, 'D', 'in', 2);
    }
    this.envelopeSustainParam = this.envelope.parameters.get('s');
    if (this.envelopeSustainParam) {
      this.envelopeSustainParam.value = s;
      this.addPlug(this.envelopeSustainParam, 'S', 'in', 3);
    }
    this.envelopeReleaseParam = this.envelope.parameters.get('r');
    if (this.envelopeReleaseParam) {
      this.envelopeReleaseParam.value = r;
      this.addPlug(this.envelopeReleaseParam, 'R', 'in', 4);
    }
    
    this.addPlug(this.envelope, 'Trigger', 'in', 0);
    this.addPlug(this.envelope, 'Out', 'out', 5);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }
  
  handleMousedown(mousedownEvent: Vec2): void {
    const paramUnderMouse = this.getParamByPosition(mousedownEvent);
    if (!paramUnderMouse) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.paramMousedownValue = paramUnderMouse.value;
  }
  
  handleMousemove(mousemoveEvent: Vec2): void {
    if (!this.mousedownPos || !this.paramMousedownValue) {
      return;
    }
    const paramToUpdate = this.getParamByPosition(this.mousedownPos);
    if (!paramToUpdate) {
      return;
    }
    const changeAmount = (mousemoveEvent.y - this.mousedownPos.y) / 100;
    paramToUpdate.value = this.paramMousedownValue + changeAmount;
  }

  getParamByPosition(position: Vec2): AudioParam | null | undefined {
    if (position.y < 40) {

      return null;
    }
    if (position.y < 90) {
      return this.envelopeAttackParam;
    }
    if (position.y < 140) {
      return this.envelopeDecayParam;
    }
    if (position.y < 190) {
      return this.envelopeSustainParam;
    }
    if (position.y < 240) {
      return this.envelopeReleaseParam;
    }

    return null;
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.save();
    renderContext.fillStyle = '#ff0000';
    renderContext.fillRect(0, 0, this.width, 70);
    renderContext.fillRect(0, 120, this.width, 50);
    renderContext.restore();
    super.render(renderContext);
  }
}
