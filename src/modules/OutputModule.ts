import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class OutputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  constructor(context: AudioContext) {
    super();
    this.context = context;
    const outputPlug = new Plug(this, this.context.destination, {x: 50, y: 50});
    this.plugs.push(outputPlug);
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.beginPath();
    renderContext.fillStyle = "#00ff00";
    renderContext.arc(50, 50, 20, 0, 2 * Math.PI);
    renderContext.fill();
  }
}