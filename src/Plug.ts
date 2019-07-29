import { Vec2 } from "./types.js";
import RackModule from "./RackModule.js";

export default class Plug {
  module: RackModule;
  param: AudioNode;
  position: Vec2;
  radius: number;
  type: 'in' | 'out';
  constructor(rackModule: RackModule, param: AudioNode, position: Vec2, type: 'in' | 'out' = 'in', radius: number = 20) {
    this.module = rackModule;
    this.param = param;
    this.position = position;
    this.radius = radius;
    this.type = type;
  }

  disconnect() {
    this.param.disconnect();
  }
  connect(plug: Plug) {
    this.param.disconnect();
    this.param.connect(plug.param);
  }
}
