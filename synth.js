class Rack {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.plugs = [];
  }

  addPlug(plug) {
    this.plugs.push(plug);
  }

  addModule(module) {

  }

  findPlugByElement(el) {
    return this.plugs.find(plug => plug.el === el);
  }
}

class RackModule {

}

class Plug {
  /**
   * @param {AudioNode} node 
   * @param {HTMLElement} el
   */
  constructor(node, el, context) {
    this.node = node;
    this.el = el;
    this.context = context;
    this.el.addEventListener('mousedown', () => this.handleMousedown());
    this.context.addPlug(this);
  }

  disconnect() {
    this.node.disconnect();
  }
  connect(plug) {
    this.node.disconnect();
    this.node.connect(plug.node);
  }

  handleMousedown() {
    document.addEventListener('mouseup', (mouseupEvent) => {
      this.handleMouseup(mouseupEvent);
    }, {once: true});
  }

  handleMouseup(mouseupEvent) {
    if(!mouseupEvent.target) {
      return;
    }
    const targetPlug = this.context.findPlugByElement(mouseupEvent.target);
    if(!targetPlug) {
      return;
    }
    this.connect(targetPlug);
  }
}

class Control {
  constructor(node, el, audioContext) {
    this.node = node;
    this.el = el;
    this.audioContext = audioContext;
    el.addEventListener('input', (changeEvent) => {
      this.node.exponentialRampToValueAtTime(
        changeEvent.target.value,
        this.audioContext.currentTime + 0.01,
      );
    });
  }
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const modulatorNode = audioCtx.createOscillator();
// modulatorNode.type = 'sawtooth';
modulatorNode.frequency.value = 100;
modulatorNode.start();

const lowpassNode = audioCtx.createBiquadFilter();
lowpassNode.type = "lowpass";
lowpassNode.frequency.value = 80;

const carrierNode = audioCtx.createOscillator();
// carrierNode.type = 'sawtooth';
carrierNode.frequency.value = 131;
carrierNode.start();

const modulatorAmpNode = audioCtx.createGain();
modulatorAmpNode.gain.value = 50;

// Controls
const modulatorFreqEl = document.querySelector('#modulatorFreq');
const carrierFreqEl = document.querySelector('#carrierFreq');
const modulatorAmpEl = document.querySelector('#modulatorAmp');
const lowpassFreqEl = document.querySelector('#lowpassFreq');

const modulatorFreqControl = new Control(
  modulatorNode.frequency,
  modulatorFreqEl,
  audioCtx,
);
const lfoFreqControl = new Control(
  carrierNode.frequency,
  carrierFreqEl,
  audioCtx,
);
const lfoGainControl = new Control(
  modulatorAmpNode.gain,
  modulatorAmpEl,
  audioCtx,
);
const lowpassFreqControl = new Control(
  lowpassNode.frequency,
  lowpassFreqEl,
  audioCtx,
);


// plugs
const modulatorOutEl = document.querySelector('#modulatorOut');
const carrierFreqInEl = document.querySelector('#carrierFreqIn');
const carrierOutEl = document.querySelector('#carrierOut');
const modulatorAmpInEl = document.querySelector('#modulatorAmpIn');
const modulatorAmpGainIn = document.querySelector('#modulatorAmpGainIn');
const modulatorAmpOutEl = document.querySelector('#modulatorAmpOut');
const lowpassInEl = document.querySelector('#lowpassIn');
const lowpassFreqInEl = document.querySelector('#lowpassFreqIn');
const lowpassOutEl = document.querySelector('#lowpassOut');
const destinationInEl = document.querySelector('#destinationIn');


const rackContext = new Rack();

const plugWithContext = (node, el) => {
  new Plug(node, el, rackContext);
};

plugWithContext(
  modulatorNode,
  modulatorOutEl,
);

plugWithContext(
  carrierNode.frequency,
  carrierFreqInEl,
);

plugWithContext(
  carrierNode,
  carrierOutEl,
);

plugWithContext(
  modulatorAmpNode,
  modulatorAmpInEl,
);

plugWithContext(
  modulatorAmpNode.gain,
  modulatorAmpGainIn,
);

plugWithContext(
  modulatorAmpNode,
  modulatorAmpOutEl,
);

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

