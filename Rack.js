export default class Rack {
  /**
   * 
   * @param {AudioContext} audioContext 
   * @param {HTMLElement} rackEl 
   */
  constructor(audioContext, rackEl) {
    this.audioContext = audioContext;
    this.plugs = [];
    this.rackEl = rackEl;
  }

  addPlug(plug) {
    this.plugs.push(plug);
  }

  addModule(moduleDomEl) {
    this.rackEl.appendChild(moduleDomEl);
  }

  findPlugByElement(el) {
    return this.plugs.find(plug => plug.el === el);
  }
}
