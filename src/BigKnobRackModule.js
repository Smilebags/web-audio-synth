import RackModule from './RackModule.js';
import Plug from './Plug.js';

export default class BigKnobRackModule extends RackModule {
  constructor(rack) {
    super(rack);
    this.startingOffset = null;
    this.mouseDownEvent = null;
    this.audioContext = rack.audioContext;

    this.voltageNode = this.audioContext.createConstantSource();
    this.voltageNode.offset.value = 0;
    this.voltageNode.start();

    
    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '400px';

    this.knobEl = document.createElement('div');
    this.knobEl.style.width = '250px';
    this.knobEl.style.height = '250px';
    this.knobEl.style.backgroundColor = '#111';
    this.knobEl.style.borderRadius = '50%';
    this.knobEl.addEventListener('mousedown', this.handleMouseDown.bind(this));

    this.rootEl.appendChild(this.knobEl);

    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.outPlug = new Plug(this.voltageNode, this.outPlugEl, this.rack);
    this.registerPlug(this.outPlug);

    this.registerModule(this.rootEl);
  }

  handleMouseDown(mouseDownEvent) {
    this.startingOffset = this.voltageNode.offset.value;
    this.mouseDownEvent = mouseDownEvent;
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  };

  handleMouseMove(mouseMoveEvent) {
    this.voltageNode.offset.setValueAtTime(this.startingOffset + (-(mouseMoveEvent.clientY - this.mouseDownEvent.clientY) / 100), this.audioContext.currentTime);
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  handleMouseUp() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  createToggleButton() {}
}
