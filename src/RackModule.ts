import { Vec2 } from "./types.js";
import Plug from "./Plug.js";

export default interface RackModule {
  width: number;
  getPlugAtPosition(pos: Vec2): Plug | null;
  render(renderContext: CanvasRenderingContext2D): void;
}
