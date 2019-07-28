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
        Number(changeEvent.target.value),
        this.audioContext.currentTime,
      );
      // this.node.exponentialRampToValueAtTime(
      //   Number(changeEvent.target.value),
      //   this.audioContext.currentTime + 0.0001,
      // );
    });
  }
}
