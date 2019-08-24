import { Vec2 } from "./Vec2.js";
import Plug from "../Plug.js";

export default interface RackModule {
  width: number;
  getPlugAtPosition(pos: Vec2): Plug | null;
  render(renderContext: CanvasRenderingContext2D): void;
  onMousedown(position: Vec2): void;
  onMousemove(position: Vec2): void;
  onMouseup(position: Vec2): void;
}
