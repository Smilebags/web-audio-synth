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

  createRangeControlEl(min = 0.01, max = 10, step = 0.001) {
    const controlEl = document.createElement('input');
    controlEl.setAttribute('type', 'range');
    controlEl.setAttribute('min', min);
    controlEl.setAttribute('max', max);
    controlEl.setAttribute('step', step);
    return controlEl;
  }
}
