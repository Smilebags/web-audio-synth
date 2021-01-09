import Plug from '../Plug.js';


import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from '../types/Vec2.js';
import { isSet } from '../util/util.js';
import { subtract } from "../util/Vec2Math.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Gain';
  private gainNode: GainNode;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    const { gain = 1 } = params;
    this.context = context;
   
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = gain;
    
    this.addPlug({ param: this.gainNode, name: 'In', type: 'in' });
    this.addDialPlugAndLabel(
      this.gainNode.gain,
      this.gainNode.gain,
      'VC',
      'in',
      () => this.gainNode.gain.value.toFixed(2),
    );
    this.addPlug({ param: this.gainNode, name: 'Out', type: 'out' });

    this.addDefaultEventListeners();
  }
  
  toParams(): Object {
    return {
      ...super.toParams(),
      gain: this.gainNode.gain.value,
    }
  }
}
