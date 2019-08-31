import { Vec2 } from "./types/Vec2.js";
import RackModule from "./types/RackModule.js";

export default class Plug {
  module: RackModule;
  param: AudioNode | AudioParam;
  position: Vec2;
  name: string | null;
  radius: number;
  type: 'in' | 'out';
  constructor(
    rackModule: RackModule,
    param: AudioNode | AudioParam,
    position: Vec2,
    name: string | null = null,
    type: 'in' | 'out' = 'in',
    radius: number = 10,
  ) {
    this.module = rackModule;
    this.param = param;
    this.position = position;
    this.name = name;
    this.radius = radius;
    this.type = type;
  }

  disconnect() {
    // @ts-ignore
    this.param.disconnect();
  }
  connect(plug: Plug) {
    // @ts-ignore
    // this.param.disconnect();
    // @ts-ignore
    this.param.connect(plug.param);
  }
}
