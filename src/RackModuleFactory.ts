import RackModule from "./types/RackModule.js";
import FilterModule from "./modules/FilterModule.js";
import EnvelopeModule from "./modules/EnvelopeModule.js";
import StepSequencerModule from "./modules/StepSequencerModule.js";
import VoltageSequencerModule from "./modules/VoltageSequencerModule.js";
import KeyboardInputModule from "./modules/KeyboardInputModule.js";
import DelayModule from "./modules/DelayModule.js";
import OutputModule from "./modules/OutputModule.js";
import GainModule from "./modules/GainModule.js";
import OscillatorModule from "./modules/OscillatorModule.js";
import ReverbModule from "./modules/ReverbModule.js";
import RecorderModule from "./modules/RecorderModule.js";
import VoltageQuantizerModule from "./modules/VoltageQuantizerModule.js";
import { RackModuleType } from "./types/RackModuleType.js";



export default class RackModuleFactory {

  constructor(private audioContext: AudioContext) {}

  createModule(type: RackModuleType, params: any): RackModule {
    switch (type) {
      case 'Filter':
        return new FilterModule(this.audioContext, params);
      case 'Envelope':
        return new EnvelopeModule(this.audioContext, params);
      case 'StepSequencer':
        return new StepSequencerModule(this.audioContext, params);
      case 'VoltageSequencer':
        return new VoltageSequencerModule(this.audioContext);
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
      case 'Recorder':
        return new RecorderModule(this.audioContext);
      case 'VoltageQuantizer':
        return new VoltageQuantizerModule(this.audioContext);
      case 'Reverb':
        return new ReverbModule(this.audioContext, params);
    }
  }
}
