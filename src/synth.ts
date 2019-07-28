import Rack from './Rack.js';
// import Plug from './Plug.js';
import Control from './Control.js';
import OscillatorRackModule from './OscillatorRackModule.js';
import GainRackModule from './GainRackModule.js';
import EnvelopeRackModule from './NewEnvelopeRackModule.js';
import BigKnobRackModule from './BigKnobRackModule.js';
import SequencerRackModule from './SequencerRackModule.js';

document.addEventListener('click', init, {once: true});

async function init() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rack = new Rack(audioContext, rackContext);
  
  
  new SequencerRackModule(rack);
  new SequencerRackModule(rack);
  new SequencerRackModule(rack);
  new GainRackModule(rack);
  new GainRackModule(rack);
  // new BigKnobRackModule(rack);
  new EnvelopeRackModule(rack);
  new OscillatorRackModule(rack);
  new GainRackModule(rack);
  new GainRackModule(rack);
  new OscillatorRackModule(rack, 'sawtooth');
  // new OscillatorRackModule(rack, 101, 'sine', 0.1, 30);
  // new GainRackModule(rack, 1, 1, 200);
  
  const lowpassNode = audioContext.createBiquadFilter();
  lowpassNode.type = "lowpass";
  lowpassNode.frequency.value = 80;
  
  // Controls
  const lowpassFreqEl = document.querySelector('#lowpassFreq');
  
  new Control(
    lowpassNode.frequency,
    lowpassFreqEl,
    audioContext,
  );
  
  
  // plugs
  const lowpassInEl = document.querySelector('#lowpassIn');
  const lowpassFreqInEl = document.querySelector('#lowpassFreqIn');
  const lowpassOutEl = document.querySelector('#lowpassOut');
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('VoltPerOctaveProcessor.js'),
  ]);
}