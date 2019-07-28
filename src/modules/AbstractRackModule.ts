import RackModule from "../RackModule";
import Plug from "../Plug";
import { distance } from "../util";
import { Vec2 } from "../types";

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