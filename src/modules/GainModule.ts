import Plug from '../Plug.js';


import AbstractRackModule from "./AbstractRackModule.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  private gainNode: GainNode;
  constructor(context: AudioContext, startingGain: number = 10) {
    super();

    this.context = context;
   
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = startingGain;
    
    const inPlug = new Plug(this, this.gainNode, {x: 50, y: 50});
    this.plugs.push(inPlug);
    const vc = new Plug(this, this.gainNode.gain, {x: 50, y: 150});
    this.plugs.push(vc);
    const outputPlug = new Plug(this, this.gainNode, {x: 50, y: 250});
    this.plugs.push(outputPlug);
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.beginPath();
    renderContext.fillStyle = "#ffff00";
    renderContext.arc(50, 50, 20, 0, 2 * Math.PI);
    renderContext.fill();

    renderContext.beginPath();
    renderContext.fillStyle = "#00ff00";
    renderContext.arc(50, 150, 20, 0, 2 * Math.PI);
    renderContext.fill();
    
    renderContext.beginPath();
    renderContext.fillStyle = "#0000ff";
    renderContext.arc(50, 250, 20, 0, 2 * Math.PI);
    renderContext.fill();
  }
}
