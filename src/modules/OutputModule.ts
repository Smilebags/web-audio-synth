import RackModule from "../RackModule";
import Plug from "../Plug";
import { distance } from "../util";
import { Vec2 } from "../types";
import AbstractRackModule from "./AbstractRackModule";

export default class OutputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  constructor(context: AudioContext) {
    super();
    this.context = context;
    const outputPlug = new Plug(this.context.destination, {x: 50, y: 50});
    this.plugs.push(outputPlug);
  }

  getPlugAtPosition(pos: Vec2): Plug | null {
    return this.plugs.find(plug => {
      return distance(pos, plug.position) <= plug.radius;
    }) || null;
  }
  render(renderContext: CanvasRenderingContext2D): void {}
}