import RackModule from "../RackModule.js";
import Plug from "../Plug.js";
import { distance } from "../util.js";
import { Vec2 } from "../types.js";

export default class AbstractRackModule implements RackModule {
  width: number;
  plugs: Plug[];
  constructor() {
    this.width = 100;
    this.plugs = [];
  }

  getPlugAtPosition(pos: Vec2): Plug | null {
    return this.plugs.find(plug => {
      return distance(pos, plug.position) <= plug.radius;
    }) || null;
  }

  protected addPlug(param: AudioNode | AudioParam, name: string, type: 'in' | 'out'): void {
    const position = {
      x: this.width / 2,
      y: (this.plugs.length * 100) + 50,
    }
    this.plugs.push(new Plug(this, param, position, name, type));
  }
  render(renderContext: CanvasRenderingContext2D): void {
    this.plugs.forEach((plug, index) => {
      renderContext.beginPath();
      renderContext.fillStyle = plug.type === 'in' ? '#00ff00' : '#0000ff';
      renderContext.arc(plug.position.x, plug.position.y, plug.radius, 0, 2 * Math.PI);
      renderContext.fill();
    });
  }
}