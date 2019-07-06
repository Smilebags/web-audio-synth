export default class Control {
  /**
   * 
   * @param {AudioParam} node 
   * @param {*} el 
   * @param {*} audioContext 
   */
  constructor(node, el, audioContext) {
    this.node = node;
    this.el = el;
    this.audioContext = audioContext;
    el.addEventListener('input', (changeEvent) => {
      this.node.setValueAtTime(
        this.node.value,
        this.audioContext.currentTime,
      );
      this.node.exponentialRampToValueAtTime(
        changeEvent.target.value,
        this.audioContext.currentTime + 0.01,
      );
    });
  }
}
