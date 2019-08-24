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

  constructor(
    context: AudioContext,
    a: number = 0.01,
    d: number = 0.1,
    s: number = 0.1,
    r: number = 0.2,
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
  }
}
