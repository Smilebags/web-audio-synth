export default class Plug {
  /**
   * @param {AudioNode} node 
   * @param {HTMLElement} el
   * @param {Rack} rack
   */
  constructor(node, el, rack) {
    this.node = node;
    this.el = el;
    this.rack = rack;
    this.el.addEventListener('mousedown', () => this.handleMousedown());
    this.rack.addPlug(this);
  }

  disconnect() {
    this.node.disconnect();
  }
  connect(plug) {
    this.node.disconnect();
    this.node.connect(plug.node);
  }

  handleMousedown() {
    document.addEventListener('mouseup', (mouseupEvent) => {
      this.handleMouseup(mouseupEvent);
    }, {once: true});
  }

  handleMouseup(mouseupEvent) {
    if(!mouseupEvent.target) {
      return;
    }
    const targetPlug = this.rack.findPlugByElement(mouseupEvent.target);
    if(!targetPlug) {
      return;
    }
    this.connect(targetPlug);
  }
}
