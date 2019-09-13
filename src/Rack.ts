import { Vec2 } from "./types/Vec2.js";
import RackModule from "./types/RackModule.js";
import Plug from "./Plug.js";

import { subtract, isSet } from "./util.js";
import Cable from "./Cable.js";
import RackModuleFactory from "./RackModuleFactory.js";


interface ModuleSlot {
  module: RackModule;
  position: Vec2;
};

export default class Rack {
  cables: Cable[] = [];
  moduleSlots: ModuleSlot[] = [];
  mousedownPosition: Vec2 | null = null;
  mousedragPosition: Vec2 | null = null;
  mouseupPosition: Vec2 | null = null;
  mousedownPlug: Plug | null = null;
  mouseupPlug: Plug | null = null;
  onMousedown: (e: MouseEvent) => void;
  onMousemove: (e: MouseEvent) => void;
  onMouseup: (e: MouseEvent) => void;
  delegateModule: RackModule | null = null;

  headerHeight: number = 20;

  constructor(
    public audioContext: AudioContext,
    public renderContext: CanvasRenderingContext2D,
    private rackModuleFactory: RackModuleFactory,
  ) {
    this.addModule(this.rackModuleFactory.createModule('Output', {}));
    this.addModule(this.rackModuleFactory.createModule('Oscillator', {voltageOffset: 6, oscType: 'square'}));
    // this.addModule(new KeyboardInputModule(this.audioContext));
    // this.addModule(new EnvelopeModule(this.audioContext, 0.01, 0.1, 0, 0.1));
    // this.addModule(new EnvelopeModule(this.audioContext, 0.3, 0.1, 1, 1));
    // this.addModule(new EnvelopeModule(this.audioContext, 0.3, 0.1, 1, 1));
    // this.addModule(new FilterModule(this.audioContext));
    // this.addModule(new GainModule(this.audioContext, 1));
    // this.addModule(new GainModule(this.audioContext, 1));
    // this.addModule(new GainModule(this.audioContext, 1));
    // this.addModule(new DelayModule(this.audioContext));
    // this.addModule(new GainModule(this.audioContext, 0));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 100));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 200));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 300));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 400));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 500));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 600));
    // this.addModule(new OscillatorModule(this.audioContext, 'sawtooth', 110));
    // this.addModule(new OscillatorModule(this.audioContext, 'sawtooth', 110));
    // this.addModule(new OscillatorModule(this.audioContext, 'sawtooth', 110));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 55));
    // this.addModule(new OscillatorModule(this.audioContext, 'sine', 0.14));
    // this.addModule(new SequencerModule(this.audioContext, 64, 500));
    // this.addModule(new SequencerModule(this.audioContext, 16, 125));
    // this.addModule(new SequencerModule(this.audioContext, 64, 125));
    this.renderContext.canvas.width = window.innerWidth;
    this.renderContext.canvas.height = window.innerHeight;
    this.render();

    this.onMousedown = (e) => this.handleMousedown(e);
    this.onMousemove = (e) => this.handleMousemove(e);
    this.onMouseup = (e) => this.handleMouseup(e);
    addEventListener("mousedown", this.onMousedown);
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
    } catch (error) {
      console.error(error);
    }
    return rack;
  }

  loadModulesFromPatchObject(patchObject: {moduleSlots: any[]}): void {
    patchObject.moduleSlots.forEach((moduleSlot) => {
      const moduleInstance = this.rackModuleFactory.createModule(moduleSlot.type, moduleSlot);
      this.addModule(moduleInstance);
    });
  }

  handleMousedown(mousedownEvent: MouseEvent): void {
    const mousedownPosition = {
      x: mousedownEvent.clientX,
      y: mousedownEvent.clientY,
    };

    if(mousedownPosition.y < this.headerHeight) {
      this.handleHeaderClick(mousedownPosition);
    }

    this.mousedownPlug = this.getPlugAtRackPosition(mousedownPosition);

    if(this.mousedownPlug) {
      this.mousedownPosition = {
        x: mousedownEvent.clientX,
        y: mousedownEvent.clientY,
      };
    }
    this.delegateMousedown(mousedownPosition);
    addEventListener("mousemove", this.onMousemove);
    addEventListener("mouseup", this.onMouseup);
  }

  handleMousemove(mousemoveEvent: MouseEvent): void {
    this.mousedragPosition = {
      x: mousemoveEvent.clientX,
      y: mousemoveEvent.clientY,
    };
    this.delegateMousemove(this.mousedragPosition);
  }

  handleMouseup(mouseupEvent: MouseEvent): void {
    this.mouseupPosition = {
      x: mouseupEvent.clientX,
      y: mouseupEvent.clientY,
    };
    this.mouseupPlug = this.getPlugAtRackPosition(this.mouseupPosition);
    if (
      this.mousedownPlug
      && this.mouseupPlug
      && this.mousedownPlug !== this.mouseupPlug
    ) {
      this.patch(this.mousedownPlug, this.mouseupPlug);
    }

    this.delegateMouseup(this.mouseupPosition);
    
    this.mousedownPosition = null;
    this.mousedragPosition = null;
    this.mouseupPosition = null;
    this.mousedownPlug = null;
    this.mouseupPlug = null;
    removeEventListener('mousemove', this.onMousemove);
    removeEventListener('mouseup', this.onMouseup);
  }

  handleHeaderClick(pos: Vec2): void {
    if (pos.x < 20) {
      this.logPatchString();
      return;
    }
  }

  logPatchString() {
    const output: any = {};
    output.moduleSlots = this.moduleSlots.map((moduleSlot) => {
      return {
        module: moduleSlot.module.toParams(),
        position: moduleSlot.position,
      }
    });
    console.log(JSON.stringify(output, null, 2));
  }

  get nextAvailableSpace(): number {
    return this.moduleSlots.reduce((currentMax, slot) => {
      if (slot.position.x + slot.module.width >= currentMax) {
        return slot.position.x + slot.module.width;
      }
      return currentMax;
    }, 0);
  }

  addModule(rackModule: RackModule): void {
    const position = {
      x: this.nextAvailableSpace,
      y: this.headerHeight,
    };
    this.moduleSlots.push({module: rackModule, position});
  }

  getModuleIndex(rackModule: RackModule) {
    return this.moduleSlots.findIndex(item => item.module === rackModule);
  }

  getModulePosition(rackModule: RackModule): Vec2 {
    const moduleIndex = this.getModuleIndex(rackModule);
    return {x: moduleIndex * 100, y: this.headerHeight};
  }

  getModuleByPosition(pos: Vec2): RackModule | null {
    const moduleSlot = this.moduleSlots.find((moduleSlot) => {
      const modulePosition = moduleSlot.position;
      return modulePosition.x <= pos.x
        && modulePosition.x + moduleSlot.module.width >= pos.x;
    });
    if (moduleSlot) {
      return moduleSlot.module;
    }
    return null;
  }

  getModuleLocalPosition(rackModule: RackModule, position: Vec2): Vec2 {
    const modulePosition = this.getModulePosition(rackModule);
    return subtract(position, modulePosition);
  }

  getPlugAtRackPosition(pos: Vec2): Plug | null {
    const selectedModule = this.getModuleByPosition(pos);
    if (!selectedModule) {
      return null;
    }
    const moduleRelativePosition = subtract(
      pos,
      this.getModulePosition(selectedModule),
    );
    const selectedPlug = selectedModule.getPlugAtPosition(moduleRelativePosition);
    return selectedPlug;
  }

  patch(outPlug: Plug, inPlug: Plug): void {
    outPlug.connect(inPlug);
    this.cables.push(new Cable(this, outPlug, inPlug));
  }

  delegateMousedown(rackPosition: Vec2): void {
    const rackModule = this.getModuleByPosition(rackPosition);
    this.delegateModule = rackModule;
    if (!rackModule) {
      return;
    }
    const localPosition = this.getModuleLocalPosition(rackModule, rackPosition);
    rackModule.onMousedown(localPosition);
  }

  delegateMousemove(rackPosition: Vec2): void {
    if (!this.delegateModule) {
      return;
    }
    const localPosition = this.getModuleLocalPosition(this.delegateModule, rackPosition);
    this.delegateModule.onMousemove(localPosition);
  }

  delegateMouseup(rackPosition: Vec2): void {
    if (!this.delegateModule) {
      return;
    }
    const localPosition = this.getModuleLocalPosition(this.delegateModule, rackPosition);
    this.delegateModule.onMouseup(localPosition);
  }

  render(): void {
    this.renderContext.fillStyle = "#333333";
    this.renderContext.fillRect(
      0,
      0,
      this.renderContext.canvas.width,
      this.renderContext.canvas.height,
    );
    this.renderModules();
    this.renderCables();
    this.renderDraggingCable();
    requestAnimationFrame(() => {
      this.render();
    });
  }

  renderModules(): void {
    this.moduleSlots.forEach((moduleSlot) => {
      this.renderContext.save();
      const modulePosition = moduleSlot.position;
      this.renderContext.translate(modulePosition.x, modulePosition.y);
      this.renderContext.fillStyle = "#222222";
      this.renderContext.fillRect(0, 0, moduleSlot.module.width, 400);
      moduleSlot.module.render(this.renderContext);
      this.renderContext.restore();
    });
  }

  renderCables(): void {
    this.cables.forEach(cable => cable.render(this.renderContext));
  }

  renderDraggingCable() {
    if(!this.mousedownPosition || !this.mousedragPosition) {
      return;
    }
    this.renderContext.strokeStyle = "#ff0000";
    this.renderContext.lineWidth = 4;
    this.renderContext.beginPath();
    this.renderContext.moveTo(
      this.mousedownPosition.x,
      this.mousedownPosition.y,
    );
    this.renderContext.lineTo(
      this.mousedragPosition.x,
      this.mousedragPosition.y,
    );
    this.renderContext.stroke();
  }
}
