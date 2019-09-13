import RackModule from "./types/RackModule.js";
import FilterModule from "./modules/FilterModule.js";
import EnvelopeModule from "./modules/EnvelopeModule.js";
import SequencerModule from "./modules/SequencerModule.js";
import KeyboardInputModule from "./modules/KeyboardInputModule.js";
import DelayModule from "./modules/DelayModule.js";
import OutputModule from "./modules/OutputModule.js";
import GainModule from "./modules/GainModule.js";
import OscillatorModule from "./modules/OscillatorModule.js";

export type RackModuleType = 'Filter'
  | 'Envelope'
  | 'Sequencer'
  | 'KeyboardInput'
  | 'Delay'
  | 'Output'
  | 'Gain'
  | 'Oscillator';

export default class RackModuleFactory {

  constructor(private audioContext: AudioContext) {}

  createModule(type: RackModuleType, params: any): RackModule {
    switch (type) {
      case 'Filter':
        return new FilterModule(this.audioContext, params);
      case 'Envelope':
        return new EnvelopeModule(this.audioContext, params);
      case 'Sequencer':
        return new SequencerModule(this.audioContext, params);
      case 'KeyboardInput':
        return new KeyboardInputModule(this.audioContext, params);
      case 'Delay':
        return new DelayModule(this.audioContext, params);
      case 'Output':
        return new OutputModule(this.audioContext);
      case 'Gain':
        return new GainModule(this.audioContext, params);
      case 'Oscillator':
        return new OscillatorModule(this.audioContext, params);
    }
  }
}
