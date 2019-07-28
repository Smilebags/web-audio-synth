


import RackModule from './RackModule.js';
import Plug from './Plug.js';
import Control from './Control.js';

export default class EnvelopeRackModule extends RackModule {
  constructor(rack) {
    super(rack);
    this.audioContext = rack.audioContext;

    this.envelope = new AudioWorkletNode(this.audioContext, 'envelope-generator-processor');
    
    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '100px';

    
    this.inPlugEl = document.createElement('div');
    this.inPlugEl.classList.add('plug');
    this.inPlugEl.classList.add('in');
    this.rootEl.appendChild(this.inPlugEl);

    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.inPlug = new Plug(this.envelope, this.inPlugEl, this.rack);
    this.outPlug = new Plug(this.envelope, this.outPlugEl, this.rack);
    this.registerPlug(this.inPlug);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);
  }
}
