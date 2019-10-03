import RackModule from "../types/RackModule.js";
import Plug from "../Plug.js";
import { distance, clamp } from "../util.js";
import { Vec2 } from "../types/Vec2.js";

interface Label {
  getText: () => string;
  position: Vec2;
  align: CanvasTextAlign;
};

export default abstract class AbstractRackModule implements RackModule {
  width: number = 100;
  plugs: Plug[] = [];
  labels: Label[] = [];
  abstract type: string;
  name: string | null = null;
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

  protected addPlug(
    param: AudioNode | AudioParam, 
    name: string,
    type: 'in' | 'out',
    order: number | null = null,
    positioning: 'left' | 'center' | 'right' = 'center',
  ): void {
    const slot = order !== null ? order : this.firstAvailablePlugSlot;
    let positioningOffset = 0;
    if (positioning !== 'center') {
      const offsetAmount = this.width / 6;
      positioningOffset += positioning === 'left' ? -offsetAmount : offsetAmount;
    }
    const xPosition = (this.width / 2) + positioningOffset;
    const yPosition = (slot * 50) + 50;
    const position = {
      x: xPosition,
      y: yPosition,
    }
    this.plugs.push(new Plug(this, param, position, name, type));
  }

  get firstAvailablePlugSlot() {
    return this.plugs.length;
  }

  protected addLabel(label: Partial<Label>): void {
    const defaultLabel: Label = {
      getText: () => '',
      position: {x: 0, y: 0},
      align: 'left',
    };
    this.labels.push({
      ...defaultLabel,
      ...label,
    });
  }

  renderButton(
    renderContext: CanvasRenderingContext2D,
    position: Vec2,
    size: Vec2,
    text: string,
    enabled: boolean,
  ): void {
    renderContext.save();
    renderContext.fillStyle = enabled ? '#d08030' : '#504030';
    renderContext.fillRect(position.x, position.y, size.x, size.y);
    renderContext.textAlign = 'center';
    renderContext.fillStyle = '#ffffffc0';
    renderContext.font = "14px Arial";
    renderContext.fillText(
      text,
      position.x + (0.5 * size.x),
      position.y + (0.5 * size.y) + 7,
    );
    renderContext.restore();
  }

  renderDial(
    renderContext: CanvasRenderingContext2D,
    pos: Vec2,
    radius: number,
    angle: number,
    text: string
  ): void {
    renderContext.save();
    renderContext.fillStyle = '#303030';
    renderContext.beginPath();
    renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    renderContext.fill();
    renderContext.strokeStyle = '#404040';
    renderContext.lineWidth = radius / 10;
    renderContext.beginPath();
    renderContext.moveTo(pos.x, pos.y);
    const offset = {
      x: Math.sin(angle) * radius,
      y: Math.cos(angle) * radius,
    };
    renderContext.lineTo((pos.x) + offset.x, pos.y - offset.y);
    renderContext.stroke();
    this.renderLabel(renderContext, {
      getText: () => text,
      position: { x: pos.x, y: pos.y + 5 },
      align: 'center',
    });
    renderContext.restore();
  }

  renderLed(
    renderContext: CanvasRenderingContext2D,
    pos: Vec2,
    radius: number,
    level: number,
  ): void {
    renderContext.save();
    renderContext.fillStyle = '#301210';
    renderContext.beginPath();
    renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    renderContext.fill();
    renderContext.fillStyle = '#b01510';
    renderContext.globalAlpha = clamp(level);
    renderContext.beginPath();
    renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    renderContext.fill();
    renderContext.restore();
  }

  renderLabel(renderContext: CanvasRenderingContext2D, label: Label) {
    const text = label.getText();
    renderContext.save();
    renderContext.textAlign = label.align;
    renderContext.fillStyle = '#ffffff';
    renderContext.font = "10px Arial";
    renderContext.fillText(text, label.position.x, label.position.y);
    renderContext.restore();
  }

  renderPlug(renderContext: CanvasRenderingContext2D, plug: Plug) {
    renderContext.fillStyle = '#ffffff';
    renderContext.fillText(
      plug.name || '',
      plug.position.x,
      plug.position.y - plug.radius - 4,
    );
    renderContext.beginPath();
    renderContext.fillStyle = plug.type === 'in' ? '#404040' : '#b8b8b8';
    renderContext.arc(plug.position.x, plug.position.y, plug.radius, 0, 2 * Math.PI);
    renderContext.fill();
    renderContext.closePath();
    
    renderContext.beginPath();
    renderContext.fillStyle = '#000000';
    renderContext.arc(plug.position.x, plug.position.y, plug.radius - 1.5, 0, 2 * Math.PI);
    renderContext.fill();
    renderContext.closePath();
  }

  render(renderContext: CanvasRenderingContext2D): void {
    renderContext.textAlign = "center";
    renderContext.fillStyle = '#ffffff';
    renderContext.font = "16px Arial";
    renderContext.fillText(this.name || this.type, this.width / 2, 20);

    renderContext.font = "12px Arial";
    this.plugs.forEach((plug) => {
      this.renderPlug(renderContext, plug);
    });

    this.labels.forEach((label) => {
      this.renderLabel(renderContext, label);
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

  abstract toParams(): Object;
}