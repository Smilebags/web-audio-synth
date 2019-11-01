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

  private mousedownParam: AudioParam | null = null;
  private paramInitialValue: number | null = null;
  private mousedownPos: Vec2 | null = null;

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
    
    this.addPlug(this.gainNode, 'In', 'in');
    this.addDialPlugAndLabel(
      this.gainNode.gain,
      this.gainNode.gain,
      'VC',
      'in',
      () => this.gainNode.gain.value.toFixed(2),
    );
    this.addPlug(this.gainNode, 'Out', 'out');

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    this.addEventListener('mouseup', () => {this.handleMouseup()});
  }
  
  handleMousedown(pos: Vec2): void {
    const dialParam = this.getDialParamFromPosition(pos);
    if (!dialParam) {
      return;
    }
    this.mousedownParam = dialParam;
    this.paramInitialValue = dialParam.value;
    this.mousedownPos = pos;
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    if (
      this.mousedownPos === null
      || this.mousedownParam === null
      || this.paramInitialValue === null
    ) {
      return;
    }
    const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
    if (this.mousedownParam) {
      this.mousedownParam.value = this.paramInitialValue + (relativeYPos / 2**6 );
    } 
  }

  handleMouseup(): void {
    this.mousedownParam = null;
    this.paramInitialValue = null;
    this.mousedownPos = null;
  }

  toParams(): any {
    return {
      type: this.type,
      gain: this.gainNode.gain.value,
    }
  }
}
