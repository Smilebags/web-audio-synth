import RackModule from "../types/RackModule.js";
import Plug from "../Plug.js";
import { distance, clamp } from "../util.js";
import { Vec2 } from "../types/Vec2.js";

interface Label {
  getText: () => string;
  position: Vec2;
  align: CanvasTextAlign;
};

interface Button {
  position: Vec2;
  size: Vec2;
  text: () => string;
  enabled: () => boolean;
  callback: Function;
}

export default abstract class AbstractRackModule implements RackModule {
  width: number = 100;
  plugs: Plug[] = [];
  labels: Label[] = [];
  dials: {pos: Vec2, radius: number, param: AudioParam}[] = [];
  buttons: Button[] = [];

  abstract type: string;
  name: string | null = null;
  private label: string | null;
  private eventListeners: {[key: string]: Function[]} = {};

  protected mousedownParam: AudioParam | null = null;
  protected paramInitialValue: number | null = null;
  protected mousedownPos: Vec2 | null = null;
  protected paramValueOffset: number | null = null;

  private isInRenameMode = false;

  constructor(params: {label?: string}) {
    this.label = params.label || null;
  }


  getPlugAtPosition(pos: Vec2): Plug | null {
    return this.plugs.find(plug => {
      return distance(pos, plug.position) <= plug.radius;
    }) || null;
  }

  getPlugIndex(plug: Plug): number {
    return this.plugs.findIndex(modulePlug => modulePlug === plug);
  }

  getPlugByIndex(index: number): Plug | null {
    return this.plugs[index] || null;
  }

  getAllPlugs(): Plug[] {
    return this.plugs;
  }

  addDefaultEventListeners() {
    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    this.addEventListener('mouseup', () => {this.handleMouseup()});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (mousedownEvent.y <= 16) {
      this.enterRenameMode();
    }
    const param = this.getDialParamFromPosition(mousedownEvent);
    if (param) {
      this.mousedownParam = param;
      this.mousedownPos = mousedownEvent;
      this.paramInitialValue = param.value;
      return;
    }
    const selectedButton = this.buttons
      .find(button => this.testButtonIntersection(button, mousedownEvent));
    if (selectedButton) {
      selectedButton.callback();
      return;
    }
  }

  handleMousemove(mousemoveEvent: Vec2): void {
    if (
      this.mousedownPos === null
      || this.mousedownParam === null
      || this.paramInitialValue === null
    ) {
      return;
    }
    const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
    this.paramValueOffset = this.paramInitialValue + (relativeYPos / 2**7 );
    if (this.mousedownParam) {
      this.mousedownParam.value = this.paramValueOffset;
    } 
  }

  handleMouseup(): void {
    this.mousedownParam = null;
    this.paramInitialValue = null;
    this.mousedownPos = null;
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

  enterRenameMode() {
    this.isInRenameMode = true;
    if (this.label === null) {
      this.label = this.displayName;
    }
    document.addEventListener('keydown', this.handleRenameModeKeyboardKeystroke);
  }

  handleRenameModeKeyboardKeystroke = (e: KeyboardEvent) => {
    if (this.label === null) {
      return; //this shouldn't happen if label is set prior to adding the event listener
    }
    switch(e.keyCode)
    {
      case 8:
        if (this.label === '') {
          break;
        }
        this.label = this.label!.substring(0, this.label.length - 1);
        break;
      case 13:
        this.isInRenameMode = false;
        document.removeEventListener('keydown', this.handleRenameModeKeyboardKeystroke);
        break;
      default:
        if (
          (e.keyCode >= 48 && e.keyCode <= 57)
          || (e.keyCode >= 65 && e.keyCode <= 90)
          || e.keyCode === 32
        ) {
          this.label += e.key;
        }
        break;
    }
  }

  private getYPositionFromOrder(order: number | null = null) {
    const slot = order !== null ? order : this.firstAvailablePlugSlot;
    return (slot * 45) + 55;
  }

  protected getDialParamFromPosition(pos: Vec2): AudioParam | null {
    const foundDial = this.dials.find((dial) => {
      return distance(dial.pos, pos) <= dial.radius;
    });
    if (!foundDial) {
      return null;
    }
    return foundDial.param;
  }

  protected addDialPlugAndLabel(
    plugParam: AudioParam | AudioNode, 
    dialParam: AudioParam,
    name: string,
    type: 'in' | 'out',
    label: () => string,
    order: number | null = null,
  ) {

    const dialPos = {
      x: 20,
      y: this.getYPositionFromOrder(order),
    };
    this.addDial(
      dialPos,
      12,
      dialParam,
    );

    const labelPos = {
      x: 90,
      y: this.getYPositionFromOrder(order) + 5,
    };
    this.addLabel({
      getText: label,
      position: labelPos,
      align: 'right',
    });

    this.addPlug(
      plugParam,
      name,
      type,
      order,
    );
  }

  protected addButton(button: Button) {
    this.buttons.push(button);
  }

  private testButtonIntersection(button: Button, pos: Vec2): boolean {
    return (button.position.x <= pos.x)
      && (button.position.y <= pos.y)
      && (button.position.x + button.size.x >= pos.x)
      && (button.position.y + button.size.y >= pos.y);
  }

  protected addDial(
    pos: Vec2,
    radius: number,
    param: AudioParam,
  ) {
    this.dials.push({pos, radius, param});
  }

  protected addPlug(
    param: AudioNode | AudioParam, 
    name: string,
    type: 'in' | 'out',
    order: number | null = null,
    positioning: 'left' | 'center' | 'right' | 'fixed' = 'center',
    fixedPosition?: Vec2,
  ): void {
    let position = fixedPosition;
    if (positioning !== 'fixed') {
      let positioningOffset = 0;
      if (positioning !== 'center') {
        const offsetAmount = this.width / 6;
        positioningOffset += positioning === 'left' ? -offsetAmount : offsetAmount;
      }
      const xPosition = (this.width / 2) + positioningOffset;
      const yPosition = this.getYPositionFromOrder(order);
      position = {
        x: xPosition,
        y: yPosition,
      }
    }
    this.plugs.push(new Plug(this, param, position!, name, type));
  }

  get firstAvailablePlugSlot() {
    return this.plugs.length;
  }

  get displayName(): string {
    if (this.label !== null) {
      return this.label;
    }
    if (this.name !== null) {
      return this.name;
    }
    return this.type;
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
    renderContext.fillText(this.displayName, this.width / 2, 20);
    if (this.isInRenameMode) {
      renderContext.save();
      renderContext.fillStyle = '#ffffff';
      renderContext.fillRect(5, 20, 90, 2);
      renderContext.restore();
    }
    renderContext.font = "12px Arial";
    this.plugs.forEach((plug) => {
      this.renderPlug(renderContext, plug);
    });

    this.labels.forEach((label) => {
      this.renderLabel(renderContext, label);
    });

    this.buttons.forEach((button) => {
      this.renderButton(
        renderContext,
        button.position,
        button.size,
        button.text(),
        button.enabled(),
      );
    });

    this.dials.forEach((dial) => this.renderDial(
      renderContext,
      dial.pos,
      dial.radius,
      dial.param.value * 2 * Math.PI,
      '',
    ));
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

  toParams(): Object {
    return {
      type: this.type,
      label: this.label,
    };
  }
}