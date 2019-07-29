import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Osc';
  private osc: OscillatorNode;
  private vo: AudioWorkletNode;
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
  }
}