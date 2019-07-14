import Plug from "./Plug.js";

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

    this.outputSectionEl = this.createDivWithClasses('output-section');
    this.outLabel = this.createLabel('OUT', true);

    this.destinationPlug = this.createPlug(this.audioContext.destination, 'in');
    
    this.outputSectionEl.appendChild(this.outLabel);
    this.outputSectionEl.appendChild(this.destinationPlug.el);

    this.rackEl.appendChild(this.outputSectionEl);

// plugWithContext(
//   lowpassNode,
//   lowpassInEl,
// );

// plugWithContext(
//   lowpassNode.frequency,
//   lowpassFreqInEl,
// );

// plugWithContext(
//   lowpassNode,
//   lowpassOutEl,
// );

// plugWithContext(
//   audioContext.destination,
//   destinationInEl,
// );

  }

  addPlug(plug) {
    this.plugs.push(plug);
  }

  createDivWithClasses(...classes) {
    const el = document.createElement('div');
    el.classList.add(...classes);
    return el;
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

  createPlug(paramOrNode, type = 'in') {
    const el = this.createDivWithClasses('plug', type);
    return new Plug(paramOrNode, el, this);
  }

  addModule(moduleDomEl) {
    this.rackEl.appendChild(moduleDomEl);
  }


  findPlugByElement(el) {
    return this.plugs.find(plug => plug.el === el);
  }
}
