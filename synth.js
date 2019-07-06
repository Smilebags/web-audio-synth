import Rack from './Rack.js';
import Plug from './Plug.js';
import Control from './Control.js';
import OscillatorRackModule from './OscillatorRackModule.js';
import GainRackModule from './GainRackModule.js';



const audioCtx = new AudioContext();
const rackEl = document.querySelector('.rack');
const rack = new Rack(audioCtx, rackEl);

new OscillatorRackModule(rack, 101, 'sine', 0.1, 30);
new GainRackModule(rack, 1, 1, 200);
new OscillatorRackModule(rack, 3, 'square', 0.2, 4);
new GainRackModule(rack, 1, 1, 200);
new OscillatorRackModule(rack, 50, 'sawtooth');
new GainRackModule(rack);

const lowpassNode = audioCtx.createBiquadFilter();
lowpassNode.type = "lowpass";
lowpassNode.frequency.value = 80;

// Controls
const lowpassFreqEl = document.querySelector('#lowpassFreq');

new Control(
  lowpassNode.frequency,
  lowpassFreqEl,
  audioCtx,
);


// plugs
const lowpassInEl = document.querySelector('#lowpassIn');
const lowpassFreqInEl = document.querySelector('#lowpassFreqIn');
const lowpassOutEl = document.querySelector('#lowpassOut');
const destinationInEl = document.querySelector('#destinationIn');



const plugWithContext = (node, el) => {
  new Plug(node, el, rack);
};

plugWithContext(
  lowpassNode,
  lowpassInEl,
);

plugWithContext(
  lowpassNode.frequency,
  lowpassFreqInEl,
);

plugWithContext(
  lowpassNode,
  lowpassOutEl,
);

plugWithContext(
  audioCtx.destination,
  destinationInEl,
);
