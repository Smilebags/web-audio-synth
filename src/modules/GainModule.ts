import Plug from '../Plug.js';


import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from '../types/Vec2.js';
import { subtract } from '../util.js';

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Gain';
  private gainNode: GainNode;

  private initialGain: number | null = null;
  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(context: AudioContext, startingGain: number = 1) {
    super();

    this.context = context;
   
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = startingGain;
    
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
    if (!this.mousedownPos || !this.initialGain) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.gainNode.gain.value = this.initialGain + (relativeYPos * 0.02);
  }
  isInVolumeBox(pos: Vec2): boolean {
    return pos.y >= 200;
  }
}
