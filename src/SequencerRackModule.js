import RackModule from './RackModule.js';
import Plug from './Plug.js';

export default class SequencerRackModule extends RackModule {
  constructor(rack) {
    super(rack);
    this.audioContext = rack.audioContext;

    this.buttons = [];
    this.states = [];
    this.currentIndex = 0;
    this.buttonCount = 16;
    this.lowVoltage = 0;
    this.highVoltage = 5;
    this.tickInterval = 200;

    this.voltageNode = this.audioContext.createConstantSource();
    this.voltageNode.offset.value = 0;
    this.voltageNode.start();

    
    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '100px';

    for (let i = 0; i < this.buttonCount; i++) {
      const button = this.createToggleButton(i);
      this.buttons.push(button);
      this.states.push(false);
      this.rootEl.appendChild(button);
    }

    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.outPlug = new Plug(this.voltageNode, this.outPlugEl, this.rack);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);

    setInterval(() => this.tick(), this.tickInterval);
  }
  tick() {
    this.buttons[this.currentIndex].classList.remove('current');
    this.currentIndex = (this.currentIndex + 1) % this.buttonCount;
    this.buttons[this.currentIndex].classList.add('current');

    if(this.states[this.currentIndex]) {
      this.voltageNode.offset.setValueAtTime(this.highVoltage, this.audioContext.currentTime);
    } else {
      this.voltageNode.offset.setValueAtTime(this.lowVoltage, this.audioContext.currentTime);
    }
  }

  handleClick(index) {
    this.states[index] = !this.states[index];
    if (this.buttons[index].classList.contains('enabled')) {
      this.buttons[index].classList.remove('enabled');
    } else {
      this.buttons[index].classList.add('enabled');
    }
  }

  createToggleButton(index) {
    const toggleButton = document.createElement('div');
    toggleButton.classList.add('toggle-button');
    toggleButton.addEventListener('click', () => this.handleClick(index));
    return toggleButton;

  }
}
