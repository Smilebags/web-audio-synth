import FilterModule from "./modules/FilterModule.js";
import EnvelopeModule from "./modules/EnvelopeModule.js";
import SequencerModule from "./modules/SequencerModule.js";
import KeyboardInputModule from "./modules/KeyboardInputModule.js";
import DelayModule from "./modules/DelayModule.js";
import OutputModule from "./modules/OutputModule.js";
import GainModule from "./modules/GainModule.js";
import OscillatorModule from "./modules/OscillatorModule.js";
import ReverbModule from "./modules/ReverbModule.js";
import RecorderModule from "./modules/RecorderModule.js";
export default class RackModuleFactory {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }
    createModule(type, params) {
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
            case 'Recorder':
                return new RecorderModule(this.audioContext);
            case 'Reverb':
                return new ReverbModule(this.audioContext, params);
        }
    }
}
