import { Vec2 } from "./types.js";
import RackModule from "./RackModule.js";

export default class Plug {
  module: RackModule;
  param: AudioNode | AudioParam;
  position: Vec2;
  radius: number;
  type: 'in' | 'out';
  constructor(rackModule: RackModule, param: AudioNode | AudioParam, position: Vec2, type: 'in' | 'out' = 'in', radius: number = 20) {
    this.module = rackModule;
    this.param = param;
    this.position = position;
    this.radius = radius;
    this.type = type;
  }

  disconnect() {
    // @ts-ignore
    this.param.disconnect();
  }
  connect(plug: Plug) {
    // @ts-ignore
    this.param.disconnect();
    // @ts-ignore
    this.param.connect(plug.param);
  }
}
