import { Plug, Vec2 } from "./types.js";
import { distance as dist } from "./util.js";
import RackModule from "./RackModule.js";

export default class Rack {
  audioContext: AudioContext;
  plugs: Plug[];
  modules: RackModule[];
  renderContext: CanvasRenderingContext2D;

  constructor(audioContext: AudioContext, context: CanvasRenderingContext2D) {
    this.audioContext = audioContext;
    this.plugs = [];
    this.modules = [];
    this.renderContext = context;
    this.render();
  }

  addPlug(plug: Plug): void {
    this.plugs.push(plug);
  }

  addModule(rackModule: RackModule): void {
    this.modules.push(rackModule);
  }

  positionIsInPlug(pos: Vec2, plug: Plug): boolean {
    return dist(pos, plug.position) <= plug.radius;
  }

  findPlugByLocation(pos: Vec2): Plug | null {
    return this.plugs.find(plug => this.positionIsInPlug(pos, plug)) || null;
  }

  render() {
    this.renderContext.fillStyle = "#443322";
    this.renderContext.fillRect(
      0,
      0,
      this.renderContext.canvas.width,
      this.renderContext.canvas.height,
    );
  }
}
