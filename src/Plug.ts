import { Vec2 } from "./types/Vec2.js";
import RackModule from "./types/RackModule.js";

interface PlugParameters {
  rackModule: RackModule;
  param: AudioNode | AudioParam;
  position: Vec2;
  name?: string | null;
  type?: 'in' | 'out';
  radius?: number;
  channel?: number;
}

export default class Plug {
  module: RackModule;
  param: AudioNode | AudioParam;
  position: Vec2;
  name: string | null;
  radius: number;
  type: 'in' | 'out';
  channel?: number;

  constructor({
    rackModule,
    param,
    position,
    name = null,
    type = 'in',
    radius = 10,
    channel = undefined,
  }: PlugParameters,
  ) {
    this.module = rackModule;
    this.param = param;
    this.position = position;
    this.name = name;
    this.radius = radius;
    this.type = type;
    this.channel = channel;
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
    if (this.param instanceof AudioNode) {
      // @ts-ignore
      this.param.connect(plug.param, this.channel);
      return;
    }
    // @ts-ignore
    this.param.connect(plug.param);
  }
}
