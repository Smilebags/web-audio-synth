export default class RackModule {
  constructor(rack) {
    this.rack = rack;
  }
  registerPlug(plug) {
    this.rack.addPlug(plug);
  }

  registerModule(rootDomEl) {
    this.rack.addModule(rootDomEl);
  }

  createLabel(text) {
    const el = document.createElement('p');
    el.style.display = 'flex';
    el.style.width = '100%';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.innerText = text;
    el.classList.add('label');
    return el;
  }

  createRangeControlEl(min = 0.01, max = 10, step = 0.001) {
    const controlEl = document.createElement('input');
    controlEl.setAttribute('type', 'range');
    controlEl.setAttribute('min', min);
    controlEl.setAttribute('max', max);
    controlEl.setAttribute('step', step);
    return controlEl;
  }
}
