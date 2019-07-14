import Rack from './Rack.js';
// import Plug from './Plug.js';
import Control from './Control.js';
import OscillatorRackModule from './OscillatorRackModule.js';
import GainRackModule from './GainRackModule.js';
import EnvelopeRackModule from './NewEnvelopeRackModule.js';

document.addEventListener('click', init, {once: true});

async function init() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl = document.querySelector('.rack');
  const rack = new Rack(audioContext, rackEl);
  
  
  new OscillatorRackModule(rack, 3, 'square', 0.2, 40);
  new EnvelopeRackModule(rack);
  new GainRackModule(rack, 1, 1, 200);
  new OscillatorRackModule(rack, 50, 'sawtooth');
  new GainRackModule(rack);
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

async function registerProcessors(audioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('EnvelopeGeneratorProcessor.js'),
  ]);
}