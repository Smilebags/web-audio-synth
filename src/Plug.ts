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

  disconnect(plug: Plug) {
    // @ts-ignore
    this.param.disconnect(plug.param);
  }
  connect(plug: Plug) {
    if (this.type === plug.type) {
      alert('You cannot connect two plugs of the same type');
      throw 'You cannot connect two plugs of the same type';
      return;
    }
    if (this.type === 'in' && plug.type === 'out') {
      plug.connect(this);
      return;
    }
    // @ts-ignore
    this.param.connect(plug.param);
  }
}
