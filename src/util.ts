import { Vec2 } from "./types.js";

export function distance(pos1: Vec2, pos2: Vec2) {
  return (((pos2.x - pos1.x) ** 2) + ((pos2.y - pos1.y) ** 2)) ** 0.5;
}
export function subtract(pos1: Vec2, pos2: Vec2) {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y,
  };
}