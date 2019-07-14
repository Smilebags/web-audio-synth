import RackModule from './RackModule.js';
import Plug from './Plug.js';
import Control from './Control.js';

export default class GainRackModule extends RackModule {
  constructor(rack, startingGain = 1, min = 0.01, max = 1) {
    super(rack);
    this.audioContext = rack.audioContext;
    this.node = this.audioContext.createGain();
    this.node.gain.value = startingGain;
    
    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '100px';

    this.gainControlEl = this.createRangeControlEl(min, max);
    new Control(this.node.gain, this.gainControlEl, this.audioContext);
    this.rootEl.appendChild(this.gainControlEl);
    
    this.inPlugLabelEl = this.createLabel('IN');
    this.rootEl.appendChild(this.inPlugLabelEl);
    
    this.inPlugEl = document.createElement('div');
    this.inPlugEl.classList.add('plug');
    this.inPlugEl.classList.add('in');
    this.rootEl.appendChild(this.inPlugEl);
    
    this.gainPlugLabelEl = this.createLabel('GAIN VC');
    this.rootEl.appendChild(this.gainPlugLabelEl);

    this.gainPlugEl = document.createElement('div');
    this.gainPlugEl.classList.add('plug');
    this.gainPlugEl.classList.add('in');
    this.rootEl.appendChild(this.gainPlugEl);
    
    this.outPlugLabelEl = this.createLabel('OUT');
    this.rootEl.appendChild(this.outPlugLabelEl);

    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.inPlug = new Plug(this.node, this.inPlugEl, this.rack);
    this.gainPlug = new Plug(this.node, this.gainPlugEl, this.rack);
    this.outPlug = new Plug(this.node, this.outPlugEl, this.rack);

    this.registerPlug(this.inPlug);
    this.registerPlug(this.gainPlug);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);
  }
}
