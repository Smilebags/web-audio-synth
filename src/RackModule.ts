import { Vec2 } from "./types";
import Plug from "./Plug";

export default interface RackModule {
  width: number;
  getPlugAtPosition(pos: Vec2): Plug | null;
  render(renderContext: CanvasRenderingContext2D): void;
}
