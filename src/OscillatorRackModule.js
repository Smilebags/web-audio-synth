import RackModule from './RackModule.js';
import Plug from './Plug.js';
import Control from './Control.js';

export default class OscillatorRackModule extends RackModule {
  constructor(rack, type = 'sine', min = -2, max = 8) {
    super(rack);
    this.audioContext = rack.audioContext;
    this.osc = this.audioContext.createOscillator();
    this.osc.frequency.value = 2;
    this.osc.type = type;
    this.osc.start();
    this.vo = new AudioWorkletNode(this.audioContext, 'volt-per-octave-processor');
    this.vo.connect(this.osc.frequency);

    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '200px';

    
    this.frequencyControlEl = this.createRangeControlEl(min, max);
    new Control(this.vo.parameters.get('coarse'), this.frequencyControlEl, this.audioContext);
    this.rootEl.appendChild(this.frequencyControlEl);
    
    this.frequencyPlugLabelEl = this.createLabel('FREQUENCY VC');
    this.rootEl.appendChild(this.frequencyPlugLabelEl);
    
    this.frequencyPlugEl = document.createElement('div');
    this.frequencyPlugEl.classList.add('plug');
    this.frequencyPlugEl.classList.add('in');
    this.rootEl.appendChild(this.frequencyPlugEl);
    
    this.outPlugLabelEl = this.createLabel('OUT');
    this.rootEl.appendChild(this.outPlugLabelEl);
    
    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.frequencyPlug = new Plug(this.vo, this.frequencyPlugEl, this.rack);
    this.outPlug = new Plug(this.osc, this.outPlugEl, this.rack);

    this.registerPlug(this.frequencyPlug);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);
  }
}
