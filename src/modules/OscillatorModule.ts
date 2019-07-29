import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
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
    const voPlug = new Plug(this, this.vo, {x: 50, y: 50});
    this.plugs.push(voPlug);
    const outputPlug = new Plug(this, this.osc, {x: 50, y: 150});
    this.plugs.push(outputPlug);
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.beginPath();
    renderContext.fillStyle = "#00ff00";
    renderContext.arc(50, 50, 20, 0, 2 * Math.PI);
    renderContext.fill();
    
    renderContext.beginPath();
    renderContext.fillStyle = "#0000ff";
    renderContext.arc(50, 150, 20, 0, 2 * Math.PI);
    renderContext.fill();
  }
}