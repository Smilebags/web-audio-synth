import Plug from '../Plug.js';


import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from '../types/Vec2.js';
import { subtract, isSet } from '../util.js';

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Gain';
  private gainNode: GainNode;

  private initialGain: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(
    context: AudioContext,
    {
      gain = 1,
    } : {
      gain?: number,
    }) {
    super();

    this.context = context;
   
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = gain;

    this.addLabel({
      getText: () => {
        const gain = this.gainNode.gain.value;
        return String(gain.toFixed(2));
      },
      position: {x: 5, y: 105},
    });
    
    this.addPlug(this.gainNode, 'In', 'in');
    this.addPlug(this.gainNode.gain, 'VC', 'in');
    this.addPlug(this.gainNode, 'Out', 'out');

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }
  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isInVolumeBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialGain = this.gainNode.gain.value;
  }
  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || this.initialGain === null) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.gainNode.gain.value = this.initialGain + (relativeYPos * 0.02);
  }
  isInVolumeBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }

  toParams(): any {
    return {
      type: this.type,
      gain: this.gainNode.gain.value,
    }
  }
}
