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
  render(renderContext: CanvasRenderingContext2D): void {}
}