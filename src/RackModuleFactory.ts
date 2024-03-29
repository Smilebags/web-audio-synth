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
import VoltageQuantizerModule from "./modules/VoltageQuantizerModule.js";
import { RackModuleType } from "./types/RackModuleType.js";
import MidiInputModule from "./modules/MidiInputModule.js";
import MidiCCInputModule from "./modules/MidiCCInputModule.js";
import NoiseModule from "./modules/NoiseModule.js";
import ClockDividerModule from "./modules/ClockDividerModule.js";
import SamplerModule from "./modules/SamplerModule.js";
import AudioInputModule from "./modules/AudioInputModule.js";
import GlideModule from "./modules/GlideModule.js";
import ValuesModule from "./modules/ValuesModule.js";
import ChordsModule from "./modules/ChordsModule.js";
import DistortionModule from "./modules/DistortionModule.js";
import AmplitudeModule from "./modules/AmplitudeModule.js";
import ViewerModule from "./modules/ViewerModule.js";
import MathModule from "./modules/MathModule.js";
import SampleLoaderModule from "./modules/SampleLoaderModule.js";

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
        return new VoltageSequencerModule(this.audioContext, params);
      case 'KeyboardInput':
        return new KeyboardInputModule(this.audioContext, params);
      case 'MidiInput':
        return new MidiInputModule(this.audioContext, params);
      case 'MidiCCInput':
        return new MidiCCInputModule(this.audioContext, params);
      case 'Delay':
        return new DelayModule(this.audioContext, params);
      case 'Output':
        return new OutputModule(this.audioContext, params);
      case 'Gain':
        return new GainModule(this.audioContext, params);
      case 'Oscillator':
        return new OscillatorModule(this.audioContext, params);
      case 'VoltageQuantizer':
        return new VoltageQuantizerModule(this.audioContext, params);
      case 'Reverb':
        return new ReverbModule(this.audioContext, params);
      case 'Noise':
        return new NoiseModule(this.audioContext, params);
      case 'ClockDivider':
        return new ClockDividerModule(this.audioContext, params);
      case 'Sampler':
        return new SamplerModule(this.audioContext, params);
      case 'AudioInput':
        return new AudioInputModule(this.audioContext, params);
      case 'Glide':
        return new GlideModule(this.audioContext, params);
      case 'Values':
        return new ValuesModule(this.audioContext, params);
      case 'Chords':
        return new ChordsModule(this.audioContext, params);
      case 'Distortion':
        return new DistortionModule(this.audioContext, params);
      case 'Viewer':
        return new ViewerModule(this.audioContext, params);
      case 'Math':
        return new MathModule(this.audioContext, params);
      case 'Amplitude':
        return new AmplitudeModule(this.audioContext, params);
      case 'SampleLoader':
        return new SampleLoaderModule(this.audioContext, params);
    }
  }
}
