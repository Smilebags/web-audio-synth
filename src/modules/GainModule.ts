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

    this.addDefaultEventListeners();
  }
  
  toParams(): Object {
    return {
      ...super.toParams(),
      gain: this.gainNode.gain.value,
    }
  }
}
