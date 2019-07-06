import RackModule from './RackModule.js';
import Plug from './Plug.js';
import Control from './Control.js';

export default class OscillatorRackModule extends RackModule {
  constructor(rack, startingFreq = 440, type = 'sine') {
    super(rack);
    this.audioContext = rack.audioContext;
    this.osc = this.audioContext.createOscillator();
    this.osc.frequency.value = startingFreq;
    this.osc.type = type;
    this.osc.start();

    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '200px';

    
    this.frequencyControlEl = this.createRangeControlEl(3, 200);
    new Control(this.osc.frequency, this.frequencyControlEl, this.audioContext);
    this.rootEl.appendChild(this.frequencyControlEl);
    
    this.frequencyPlugLabelEl = document.createElement('p');
    this.frequencyPlugLabelEl.textContent = 'Frequency VC';
    this.rootEl.appendChild(this.frequencyPlugLabelEl);
    
    this.frequencyPlugEl = document.createElement('div');
    this.frequencyPlugEl.classList.add('plug');
    this.rootEl.appendChild(this.frequencyPlugEl);
    
    this.outPlugLabelEl = document.createElement('p');
    this.outPlugLabelEl.textContent = 'Out';
    this.rootEl.appendChild(this.outPlugLabelEl);
    
    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.rootEl.appendChild(this.outPlugEl);

    this.frequencyPlug = new Plug(this.osc.frequency, this.frequencyPlugEl, this.rack);
    this.outPlug = new Plug(this.osc, this.outPlugEl, this.rack);

    this.registerPlug(this.frequencyPlug);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);
  }
}
