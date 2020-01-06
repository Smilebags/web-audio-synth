import { Vec2 } from "./types/Vec2.js";
import RackModule from "./types/RackModule.js";
import Plug from "./Plug.js";

import { subtract, isSet, add, distance } from "./util.js";
import Cable from "./Cable.js";
import RackModuleFactory from "./RackModuleFactory.js";
import HeaderButton from "./types/HeaderButton.js";
import SaveToClipboardButton from "./headerButtons/SaveToClipboardButton.js";
import HeaderButtonFactory from "./headerButtons/HeaderButtonFactory.js";
import ModifierKeyStatus from "./ModifierKeyStatus.js";


interface ModuleSlot {
  module: RackModule;
  position: Vec2;
};

interface CableLoadObject {
  outModule: number;
  outPlug: number;
  inModule: number;
  inPlug: number;
}

export default class Rack {
  cables: Cable[] = [];
  moduleSlots: ModuleSlot[] = [];
  private rackMousedownPosition: Vec2 | null = null;
  private rackMousemovePosition: Vec2 | null = null;
  private rackMouseupPosition: Vec2 | null = null;
  private mousedownPlug: Plug | null = null;
  private mouseupPlug: Plug | null = null;
  private onMousedown: (e: MouseEvent) => void;
  private onMousemove: (e: MouseEvent) => void;
  private onMouseup: (e: MouseEvent) => void;
  private delegateModule: RackModule | null = null;

  private scrollPosition: Vec2 = {x: 0, y:0};
  private dpr: number;

  private headerHeight: number = 32;
  private headerButtons: HeaderButton[] = [];

  private moduleHeight = 400;

  private modifierKeyStatus = new ModifierKeyStatus();

  constructor(
    public audioContext: AudioContext,
    public renderContext: CanvasRenderingContext2D,
    public rackModuleFactory: RackModuleFactory,
  ) {
    this.dpr = window.devicePixelRatio || 1;
    this.resetWindowSize();

    this.headerButtons.push(new SaveToClipboardButton(this));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Oscillator', '#0055AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Gain', '#00AA55'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Envelope', '#5500AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageSequencer', '#55AA00'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Filter', '#AA0055'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Delay', '#AA5500'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Reverb', '#0055AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'StepSequencer', '#00AA55'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageQuantizer', '#5500AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiInput', '#55AA00'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiCCInput', '#AA0055'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Noise', '#AA5500'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'ClockDivider', '#0055AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Sampler', '#00AA55'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'AudioInput', '#5500AA'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Glide', '#55AA00'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Values', '#AA0055'));
    this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Chords', '#AA5500'));

    this.onMousedown = (e) => this.handleMousedown(e);
    this.onMousemove = (e) => this.handleMousemove(e);
    this.onMouseup = (e) => this.handleMouseup(e);
    addEventListener('mousedown', this.onMousedown);
    addEventListener('resize', () => this.resetWindowSize());
    addEventListener('wheel', (e) => this.handleWheel(e), {passive: false, capture: true});

    this.render();

  }

  static fromPatchString(
    audioContext: AudioContext,
    context: CanvasRenderingContext2D,
    rackModuleFactory: RackModuleFactory,
    patchString: string,
  ): Rack {
    const rack = new Rack(audioContext, context, rackModuleFactory);
    try {
      const patch = JSON.parse(patchString);
      if (!isSet(patch.moduleSlots)) {
        throw 'Invalid patch string';
      }
      rack.loadModulesFromPatchObject(patch);
      rack.connectCablesFromPatchObject(patch);
    } catch (error) {
      console.error(error);
    }
    return rack;
  }

  resetWindowSize() {
    this.renderContext.canvas.width = window.innerWidth * this.dpr;
    this.renderContext.canvas.height = window.innerHeight * this.dpr;
  }

  handleWheel(e: WheelEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.modifierKeyStatus.shift) {
      // swap scroll directions to allow for horizontal scroll
      this.setScrollPosition({
        x: this.scrollPosition.x + e.deltaY,
        y: this.scrollPosition.y + e.deltaX,
      });
    } else {
      this.setScrollPosition({
        x: this.scrollPosition.x + e.deltaX,
        y: this.scrollPosition.y + e.deltaY,
      });
    }

    return false;
  }

  setScrollPosition(pos: Vec2) {
    this.scrollPosition.x = Math.max(pos.x, 0);
    this.scrollPosition.y = Math.max(pos.y, 0);
  }

  loadModulesFromPatchObject(patchObject: {moduleSlots: any[]}): void {
    patchObject.moduleSlots.forEach((moduleSlot) => {
      const moduleInstance = this.rackModuleFactory.createModule(moduleSlot.module.type, moduleSlot.module);
      this.addModule(moduleInstance, moduleSlot.position);
    });
  }

  connectCablesFromPatchObject(patchObject: { cables: CableLoadObject[]}) {
    patchObject.cables.forEach((cableOptions) => {
      const outModule = this.moduleSlots[cableOptions.outModule].module;
      const inModule = this.moduleSlots[cableOptions.inModule].module;
      const outPlug = outModule.getPlugByIndex(cableOptions.outPlug);
      const inPlug = inModule.getPlugByIndex(cableOptions.inPlug);
      if (!outPlug || !inPlug) {
        return;
      }
      this.patch(outPlug, inPlug);
    });
  }

  handleMousedown(mousedownEvent: MouseEvent): void {
    const mousedownPosition = {
      x: mousedownEvent.clientX,
      y: mousedownEvent.clientY,
    };

    if(mousedownPosition.y < this.headerHeight) {
      this.handleHeaderClick(mousedownPosition);
      return;
    }

    this.rackMousedownPosition = this.toRackFromWorldPosition(mousedownPosition);
    if (this.modifierKeyStatus.alt) {
      this.handleDeleteModuleClick(this.rackMousedownPosition);
      return;
    }
    addEventListener("mousemove", this.onMousemove);
    addEventListener("mouseup", this.onMouseup);
    
    this.mousedownPlug = this.getPlugAtRackPosition(this.rackMousedownPosition);
    if (this.mousedownPlug) {
      return;
    }

    this.delegateMousedown(this.rackMousedownPosition);
  }

  handleMousemove(mousemoveEvent: MouseEvent): void {
    this.rackMousemovePosition = this.toRackFromWorldPosition({
      x: mousemoveEvent.clientX,
      y: mousemoveEvent.clientY,
    });
    if(!this.mousedownPlug) {
      this.delegateMousemove(this.rackMousemovePosition);
    }
  }

  handleMouseup(mouseupEvent: MouseEvent): void {
    this.rackMouseupPosition = this.toRackFromWorldPosition({
      x: mouseupEvent.clientX,
      y: mouseupEvent.clientY,
    });
    
    if(!this.mousedownPlug) {
      this.delegateMouseup(this.rackMouseupPosition);
      this.cleanUpMouseState();
      return;
    }
    
    this.mouseupPlug = this.getPlugAtRackPosition(this.rackMouseupPosition);

    if (this.mousedownPlug === this.mouseupPlug) {
      const cable = this.getCableByPlug(this.mousedownPlug);
      if (cable) {
        this.removeCable(cable);
      }
    }
    
    if (this.mouseupPlug && this.mousedownPlug !== this.mouseupPlug) {
      this.patch(this.mousedownPlug, this.mouseupPlug);
    }

    this.cleanUpMouseState();
    

  }

  handleDeleteModuleClick(rackPos: Vec2): void {
    const selectedModule = this.getModuleByRackPosition(rackPos);
    if (!selectedModule) {
      return;
    }
    this.removeModule(selectedModule);
  }

  cleanUpMouseState(): void {
    this.rackMousedownPosition = null;
    this.rackMousemovePosition = null;
    this.rackMouseupPosition = null;
    this.mousedownPlug = null;
    this.mouseupPlug = null;
    removeEventListener('mousemove', this.onMousemove);
    removeEventListener('mouseup', this.onMouseup);
  }

  handleHeaderClick(pos: Vec2): void {
    let currentButtonStart = 0;
    for (let i = 0; i < this.headerButtons.length; i++) {
      const headerButton = this.headerButtons[i];
      if (pos.x < headerButton.width + currentButtonStart) {
        headerButton.handlePress();
        return;
      }
      currentButtonStart += headerButton.width;
    }
  }

  getPatchString(): string {
    const output: any = {};
    output.moduleSlots = this.moduleSlots.map((moduleSlot) => {
      return {
        module: moduleSlot.module.toParams(),
        position: moduleSlot.position,
      }
    });
    output.cables = this.cables.map((cable) => {
      return {
        outModule: this.getModuleIndex(cable.plug1.module),
        outPlug: cable.plug1.module.getPlugIndex(cable.plug1),
        inModule: this.getModuleIndex(cable.plug2.module),
        inPlug: cable.plug2.module.getPlugIndex(cable.plug2),
      };
    });
    return JSON.stringify(output);
  }

  get activeRow() {
    return Math.round(this.scrollPosition.y / this.moduleHeight);
  }

  get nextAvailableSpace(): Vec2 {
    const yOffset = this.activeRow;
    const relevantModuleSlots = this.moduleSlots.filter(slot => slot.position.y === yOffset);
    const xOffset = relevantModuleSlots.reduce((currentMax, slot) => {
      if (slot.position.x + slot.module.width >= currentMax) {
        return slot.position.x + slot.module.width;
      }
      return currentMax;
    }, 0);
    return {
      x: xOffset,
      y: yOffset,
    };
  }

  toRackFromWorldPosition(worldPos: Vec2): Vec2 {
    return subtract(worldPos, {x: -this.scrollPosition.x, y: this.headerHeight - this.scrollPosition.y});
  }

  fromRackToWorldPosition(rackPos: Vec2): Vec2 {
    return add(rackPos, {x: -this.scrollPosition.x, y: this.headerHeight});
  }

  addModule(rackModule: RackModule, modulePosition?: Vec2): void {
    const defaultPosition = this.nextAvailableSpace;
    this.moduleSlots.push({module: rackModule, position: modulePosition || defaultPosition});
  }

  getModuleIndex(rackModule: RackModule) {
    return this.moduleSlots.findIndex(item => item.module === rackModule);
  }

  getModuleRackPosition(rackModule: RackModule): Vec2 {
    const moduleSlot = this.getModuleSlotByModule(rackModule);
    if (!moduleSlot) {
      throw 'No module slot found';
    }
    return {
      x: moduleSlot.position.x,
      y: moduleSlot.position.y * this.moduleHeight
    };
  }

  getModuleSlotByModule(rackModule: RackModule): ModuleSlot | null {
    const slot = this.moduleSlots.find(slot => slot.module === rackModule);
    return slot || null;
  }

  getModuleByRackPosition(pos: Vec2): RackModule | null {
    const moduleSlot = this.moduleSlots.find((moduleSlot) => {
      const modulePos = moduleSlot.position;
      const xIsContained = modulePos.x <= pos.x
        && modulePos.x + moduleSlot.module.width > pos.x;
      const yIsContained = modulePos.y * this.moduleHeight <= pos.y
        && (modulePos.y * this.moduleHeight) + this.moduleHeight > pos.y;
      
      return xIsContained && yIsContained;
    });
    if (moduleSlot) {
      return moduleSlot.module;
    }
    return null;
  }

  toModuleFromRackPosition(rackModule: RackModule, position: Vec2): Vec2 {
    const modulePosition = this.getModuleRackPosition(rackModule);
    return subtract(position, modulePosition);
  }

  getPlugAtRackPosition(pos: Vec2): Plug | null {
    const selectedModule = this.getModuleByRackPosition(pos);
    if (!selectedModule) {
      return null;
    }
    const moduleRelativePosition = this.toModuleFromRackPosition(
      selectedModule,
      pos,
    );
    const selectedPlug = selectedModule.getPlugAtPosition(moduleRelativePosition);
    return selectedPlug;
  }

  patch(outPlug: Plug, inPlug: Plug): void {
    try {
      const newCable = new Cable(this, outPlug, inPlug);
      this.cables.unshift(newCable);
    } catch (error) {
      this.cleanUpMouseState();
    }
  }

  getCableByPlug(plug: Plug): Cable | null {
    return this.cables.find((cable) => {
      return cable.plug1 === plug || cable.plug2 === plug;
    }) || null;
  }
  
  getCableByPlugs(plug1: Plug, plug2: Plug): Cable | null {
    return this.cables.find((cable) => {
      return (cable.plug1 === plug1 && cable.plug2 === plug2)
        || (cable.plug1 === plug2 && cable.plug2 === plug1);
    }) || null;
  }

  removeCable(cable: Cable): void {
    cable.remove();
    const index = this.cables.indexOf(cable);
    if (index === -1) {
      return;
    }
    this.cables.splice(index, 1);
  }

  removeModule(rackModule: RackModule): void {
    const cables = this.getCablesByModule(rackModule);
    cables.map(cable => this.removeCable(cable));
    const slotIndex = this.moduleSlots.findIndex(moduleSlot => moduleSlot.module === rackModule);
    if (slotIndex === -1) {
      return;
    }
    this.moduleSlots.splice(slotIndex, 1);
  }

  getCablesByModule(rackModule: RackModule): Cable[] {
    const plugs = rackModule.getAllPlugs();
    return this.cables.filter(
      cable => (
        plugs.indexOf(cable.plug1) !== -1
        || plugs.indexOf(cable.plug2) !== -1
    ));
  }

  delegateMousedown(rackPosition: Vec2): void {
    const rackModule = this.getModuleByRackPosition(rackPosition);
    this.delegateModule = rackModule;
    if (!rackModule) {
      return;
    }
    const localPosition = this.toModuleFromRackPosition(rackModule, rackPosition);
    rackModule.onMousedown(localPosition);
  }

  delegateMousemove(rackPosition: Vec2): void {
    if (!this.delegateModule) {
      return;
    }
    const localPosition = this.toModuleFromRackPosition(this.delegateModule, rackPosition);
    this.delegateModule.onMousemove(localPosition);
  }

  delegateMouseup(rackPosition: Vec2): void {
    if (!this.delegateModule) {
      return;
    }
    const localPosition = this.toModuleFromRackPosition(this.delegateModule, rackPosition);
    this.delegateModule.onMouseup(localPosition);
  }

  render(): void {
    this.renderContext.save();
      this.renderContext.scale(this.dpr, this.dpr);
      this.renderBackground();
      this.renderContext.save();
        this.renderContext.translate(-this.scrollPosition.x, this.headerHeight - this.scrollPosition.y);
        this.renderModules();
        this.renderCables();
        this.renderDraggingCable();
      this.renderContext.restore();
      this.renderHeader();
    this.renderContext.restore();

    requestAnimationFrame(() => {
      this.render();
    });
  }

  renderBackground(): void {
    this.renderContext.fillStyle = "#333333";
    this.renderContext.fillRect(
      0,
      0,
      this.renderContext.canvas.width,
      this.renderContext.canvas.height,
    );
  }

  renderHeader(): void {
    let currentOffset = 0;
    this.renderContext.fillStyle = "#a0a0a0";
    this.renderContext.fillRect(
      0,
      0,
      this.renderContext.canvas.width,
      32,
    );
    this.headerButtons.forEach((button) => {
      this.renderContext.save();
      this.renderContext.translate(currentOffset, 0);
      button.render(this.renderContext);
      this.renderContext.restore();
      currentOffset += button.width;
    });
  }

  renderBorder(moduleSlot: ModuleSlot, offset: number, opacity: number) {
    this.renderContext.strokeStyle = "#000000";
    this.renderContext.globalAlpha = opacity;
    this.renderContext.strokeRect(
      offset,
      offset,
      moduleSlot.module.width - (offset * 2),
      this.moduleHeight - (offset * 2),
    );
  }

  renderModules(): void {
    this.moduleSlots.forEach((moduleSlot) => {
      this.renderContext.save();
      const modulePosition = moduleSlot.position;
      this.renderContext.translate(modulePosition.x, modulePosition.y * this.moduleHeight);
      this.renderContext.fillStyle = "#202020";
      this.renderContext.fillRect(0, 0, moduleSlot.module.width, this.moduleHeight);
      this.renderBorder(moduleSlot, 0, 0.5);
      this.renderBorder(moduleSlot, 1, 0.25);
      this.renderBorder(moduleSlot, 2, 0.125);
      this.renderBorder(moduleSlot, 3, 0.06);
      this.renderBorder(moduleSlot, 4, 0.03);
      this.renderContext.globalAlpha = 1;
      moduleSlot.module.render(this.renderContext);
      this.renderContext.restore();
    });
  }

  renderCables(): void {
    this.cables.forEach(cable => cable.render(this.renderContext));
  }

  renderCord(
    renderContext: CanvasRenderingContext2D,
    pos1: Vec2,
    pos2: Vec2,
    cableSlack: number,
    color: string,
  ) {
    renderContext.beginPath();
    renderContext.strokeStyle = color;
    renderContext.lineCap = 'round';
    renderContext.lineWidth = 4;
    renderContext.moveTo(pos1.x, pos1.y);
    renderContext.bezierCurveTo(
      pos1.x,
      pos1.y + cableSlack,
      pos2.x,
      pos2.y + cableSlack,
      pos2.x,
      pos2.y,
    );
    renderContext.stroke();
  }

  renderDraggingCable() {
    if(
      !this.mousedownPlug
      || !this.rackMousedownPosition
      || !this.rackMousemovePosition) {
      return;
    }
    const cableLength = distance(
      this.rackMousedownPosition,
      this.rackMousemovePosition,
    );
    const cableSlack = cableLength * 0.3;
    this.renderCord(
      this.renderContext,
      this.rackMousedownPosition,
      this.rackMousemovePosition,
      cableSlack,
      "#ff0000",
    );
    // this.renderContext.lineWidth = 4;
    // this.renderContext.lineCap = 'round';
    // this.renderContext.beginPath();
    // this.renderContext.moveTo(
    //   this.rackMousedownPosition.x,
    //   this.rackMousedownPosition.y,
    // );
    // this.renderContext.lineTo(
    //   this.rackMousemovePosition.x,
    //   this.rackMousemovePosition.y,
    // );
    // this.renderContext.stroke();
  }
}
