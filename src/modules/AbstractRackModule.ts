import RackModule from "../RackModule.js";
import Plug from "../Plug.js";
import { distance } from "../util.js";
import { Vec2 } from "../types.js";

export default abstract class AbstractRackModule implements RackModule {
  width: number = 100;
  plugs: Plug[] = [];
  abstract name: string;
  private eventListeners: {[key: string]: Function[]} = {};

  getPlugAtPosition(pos: Vec2): Plug | null {
    return this.plugs.find(plug => {
      return distance(pos, plug.position) <= plug.radius;
    }) || null;
  }

  onMousedown(position: Vec2): void {
    this.emit('mousedown', position);
  }
  onMousemove(position: Vec2): void {
    this.emit('mousemove', position);
  }
  onMouseup(position: Vec2): void {
    this.emit('mouseup', position);
  }

  protected addPlug(param: AudioNode | AudioParam, name: string, type: 'in' | 'out', order: number | null = null): void {
    const slot = order !== null ? order : this.plugs.length;
    const position = {
      x: this.width / 2,
      y: (slot * 50) + 50,
    }
    this.plugs.push(new Plug(this, param, position, name, type));
  }
  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.textAlign = "center";
    renderContext.fillStyle = '#ffffff';
    renderContext.font = "16px Arial";
    renderContext.fillText(this.name, this.width / 2, 20);

    renderContext.font = "12px Arial";
    this.plugs.forEach((plug, index) => {
      renderContext.fillStyle = '#ffffff';
      renderContext.fillText(
        plug.name || '',
        this.width / 2,
        plug.position.y - plug.radius - 4,
      );
      renderContext.beginPath();

      renderContext.fillStyle = plug.type === 'in' ? '#101010' : '#181818';
      renderContext.arc(plug.position.x, plug.position.y, plug.radius, 0, 2 * Math.PI);
      renderContext.fill();
    });
  }

  emit(eventName: string, eventValue: any): void {
    if (!this.eventListeners[eventName]) {
      return;
    }
    this.eventListeners[eventName].forEach(callback => callback(eventValue));
  }

  removeEventListener(eventName: string, callback: Function): void {
    if (!this.eventListeners[eventName]) {
      return;
    }
    const callbackIndex = this.eventListeners[eventName].indexOf(callback);
    if (callbackIndex === -1) {
      return;
    }
    this.eventListeners[eventName].splice(callbackIndex, 1);
  }

  addEventListener(eventName: string, callback: Function): void {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }
}