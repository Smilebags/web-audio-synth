import RackModule from './RackModule.js';
import Plug from './Plug.js';
import Control from './Control.js';

export default class EnvelopeRackModule extends RackModule {
  constructor(rack, a = 0.1, d = 0.1, s = 1, r = 0.5) {
    super(rack);
    this.a = a;
    this.d = d;
    this.s = s;
    this.r = r;
    this.audioContext = rack.audioContext;
    this.oneBuffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
    this.oneBuffer.getChannelData(0)[0] = 1;

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.oneBuffer;
    this.bufferSource.loop = true;
    this.bufferSource.start();

    this.envelope = this.audioContext.createGain();
    this.envelope.gain.setValueAtTime(0, this.audioContext.currentTime);

    this.bufferSource.connect(this.envelope);
    
    this.rootEl = document.createElement('div');
    this.rootEl.style.width = '100px';

    this.appendLabel('A');
    this.appendPropControl('a');
    this.appendLabel('D');
    this.appendPropControl('d');
    this.appendLabel('S');
    this.appendPropControl('s');
    this.appendLabel('R');
    this.appendPropControl('r');
    
    this.outPlugEl = document.createElement('div');
    this.outPlugEl.classList.add('plug');
    this.outPlugEl.classList.add('out');
    this.rootEl.appendChild(this.outPlugEl);

    this.outPlug = new Plug(this.envelope, this.outPlugEl, this.rack);
    this.registerPlug(this.outPlug);
    this.registerModule(this.rootEl);

    setInterval(() => {
      this.triggerOn();
    }, 2000);

    setTimeout(() => {
      setInterval(() => {
        this.triggerOff();
      }, 2000);
    }, 1000);
  }

  triggerOn() {
    this.envelope.gain.setValueAtTime(
      0,
      this.audioContext.currentTime,
    );
    this.envelope.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.a,
    );
    this.envelope.gain.linearRampToValueAtTime(
      this.s,
      this.audioContext.currentTime + this.a + this.d,
    );
  }

  triggerOff() {
    this.envelope.gain.setValueAtTime(
      this.s,
      this.audioContext.currentTime,
    );
    this.envelope.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + this.r,
    );
  }

  appendPropControl(paramName, min = 0, max = 1) {
    const control = this.createRangeControlEl(min, max);
    control.addEventListener('input', (inputEvent) => {
      this[paramName] = Number(inputEvent.target.value) || 0;
    });
    this.rootEl.appendChild(control);
  }

  appendLabel(labelText) {
    const label = this.createLabel(labelText);
    this.rootEl.appendChild(label);
  }
}
