import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class ClockDividerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'ClockDivider';
  private divider: AudioWorkletNode;
  private div2: GainNode;
  private div4: GainNode;
  private div8: GainNode;
  private div16: GainNode;
  private div32: GainNode;
  private div64: GainNode;

  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.divider = new AudioWorkletNode(this.context, 'clock-divider-processor', {numberOfOutputs: 6});

    this.div2 = this.context.createGain();
    this.div4 = this.context.createGain();
    this.div8 = this.context.createGain();
    this.div16 = this.context.createGain();
    this.div32 = this.context.createGain();
    this.div64 = this.context.createGain();

    this.divider.connect(this.div2, 0);
    this.divider.connect(this.div4, 1);
    this.divider.connect(this.div8, 2);
    this.divider.connect(this.div16, 3);
    this.divider.connect(this.div32, 4);
    this.divider.connect(this.div64, 5);

    this.addPlug(this.divider, 'In', 'in');
    const resetTriggerParam = this.divider.parameters.get('resetTrigger')!;
    this.addPlug(resetTriggerParam, 'Reset', 'in');

    this.addPlug(this.div2, '/2', 'out');
    this.addPlug(this.div4, '/4', 'out');
    this.addPlug(this.div8, '/8', 'out');
    this.addPlug(this.div16, '/16', 'out');
    this.addPlug(this.div32, '/32', 'out');
    this.addPlug(this.div64, '/64', 'out');
  }
}