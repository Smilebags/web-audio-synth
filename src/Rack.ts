import { Vec2 } from "./types.js";
import RackModule from "./RackModule.js";
import Plug from "./Plug.js";
import OutputModule from "./modules/OutputModule.js";
import OscillatorModule from "./modules/OscillatorModule.js";
import { subtract } from "./util.js";
import Cable from "./Cable.js";

export default class Rack {
  audioContext: AudioContext;
  cables: Cable[];
  modules: RackModule[];
  renderContext: CanvasRenderingContext2D;
  mousedownPosition: Vec2 | null = null;
  mousedragPosition: Vec2 | null = null;
  mouseupPosition: Vec2 | null = null;
  mousedownPlug: Plug | null = null;
  mouseupPlug: Plug | null = null;
  onMousedown: (e: MouseEvent) => void;
  onMousemove: (e: MouseEvent) => void;
  onMouseup: (e: MouseEvent) => void;

  constructor(audioContext: AudioContext, context: CanvasRenderingContext2D) {
    this.audioContext = audioContext;
    this.cables = [];
    this.modules = [
      new OutputModule(this.audioContext),
      new OscillatorModule(this.audioContext),
    ];
    this.renderContext = context;
    this.renderContext.canvas.width = window.innerWidth;
    this.renderContext.canvas.height = window.innerHeight;
    this.render();

    this.onMousedown = (e) => this.handleMousedown(e);
    this.onMousemove = (e) => this.handleMousemove(e);
    this.onMouseup = (e) => this.handleMouseup(e);
    addEventListener("mousedown", this.onMousedown);
  }

  handleMousedown(mousedownEvent: MouseEvent): void {
    this.mousedownPosition = {
      x: mousedownEvent.clientX,
      y: mousedownEvent.clientY,
    };
    this.mousedownPlug = this.getPlugAtRackPosition(this.mousedownPosition);
    addEventListener("mousemove", this.onMousemove);
  }

  handleMousemove(mousemoveEvent: MouseEvent): void {
    this.mousedragPosition = {
      x: mousemoveEvent.clientX,
      y: mousemoveEvent.clientY,
    };
    addEventListener("mouseup", this.onMouseup);
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
    
    this.mousedownPosition = null;
    this.mousedragPosition = null;
    this.mouseupPosition = null;
    this.mousedownPlug = null;
    this.mouseupPlug = null;
    removeEventListener('mousemove', this.onMousemove);
    removeEventListener('mouseup', this.onMouseup);
  }

  addModule(rackModule: RackModule): void {
    this.modules.push(rackModule);
  }

  getModuleIndex(rackModule: RackModule) {
    return this.modules.findIndex(item => item === rackModule);
  }

  getModulePosition(rackModule: RackModule): Vec2 {
    const moduleIndex = this.getModuleIndex(rackModule);
    return {x: moduleIndex * 100, y: 0};
  }

  getModuleByPosition(pos: Vec2): RackModule | null {
    return this.modules.find((rackModule) => {
      const modulePosition = this.getModulePosition(rackModule);
      return modulePosition.x <= pos.x
        && modulePosition.x + rackModule.width >= pos.x;
    }) || null;
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
    this.modules.forEach((rackModule) => {
      this.renderContext.save();
      const modulePosition = this.getModulePosition(rackModule);
      this.renderContext.translate(modulePosition.x, modulePosition.y);
      this.renderContext.fillStyle = "#222222";
      this.renderContext.fillRect(0, 0, rackModule.width, 400);
      rackModule.render(this.renderContext);
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
