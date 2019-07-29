import Plug from '../Plug.js';


import AbstractRackModule from "./AbstractRackModule.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Gain';
  private gainNode: GainNode;
  constructor(context: AudioContext, startingGain: number = 10) {
    super();

    this.context = context;
   
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = startingGain;
    
    this.addPlug(this.gainNode, 'In', 'in');
    this.addPlug(this.gainNode.gain, 'VC', 'in');
    this.addPlug(this.gainNode, 'Out', 'out');
  }
}
