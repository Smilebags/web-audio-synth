import { Vec2 } from "./types.js";
import { distance as dist } from "./util.js";
import RackModule from "./RackModule.js";
import Plug from "./Plug.js";
import OutputModule from "./modules/OutputModule.js";

export default class Rack {
  audioContext: AudioContext;
  cables: Plug[];
  modules: RackModule[];
  renderContext: CanvasRenderingContext2D;
  mousedownPosition: Vec2 | null;
  mousedragPosition: Vec2 | null;

  constructor(audioContext: AudioContext, context: CanvasRenderingContext2D) {
    this.audioContext = audioContext;
    this.cables = [];
    this.modules = [
      new OutputModule(this.audioContext),
    ];
    this.renderContext = context;
    this.renderContext.canvas.width = window.innerWidth;
    this.renderContext.canvas.height = window.innerHeight;
    this.mousedownPosition = null;
    this.mousedragPosition = null;
    this.render();
    addEventListener("mousedown", (mousedownEvent) => {this.handleMousedown(mousedownEvent)});
  }

  handleMousedown(mousedownEvent: MouseEvent): void {
    this.mousedownPosition = {
      x: mousedownEvent.clientX,
      y: mousedownEvent.clientY,
    };
    addEventListener("mousemove", (mousemoveEvent) => {this.handleMousemove(mousemoveEvent)});
  }

  handleMousemove(mousemoveEvent: MouseEvent): void {
    this.mousedragPosition = {
      x: mousemoveEvent.clientX,
      y: mousemoveEvent.clientY,
    };
    addEventListener("mouseup", (mouseupEvent) => {this.handleMouseup(mouseupEvent)});
  }

  handleMouseup(mouseupEvent: MouseEvent): void {
    // see if the module under mousedown has a plug in that location
    // see if the module under mouseup has a plug in that location
    // connect plug down to plug up
    
    // reset temporary plug
    this.mousedownPosition = null;
    this.mousedragPosition = null;
  }

  addModule(rackModule: RackModule): void {
    this.modules.push(rackModule);
  }

  getModulePosition(moduleIndex: number): Vec2 {
    return {x: moduleIndex * 100, y: 0};
  }

  getModuleByPosition(pos: Vec2): RackModule | null {
    return this.modules.find((rackModule, index) => {
      const modulePosition = this.getModulePosition(index);
      return modulePosition.x >= pos.x
        && modulePosition.x + rackModule.width <= pos.x;
    }) || null;
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
    this.modules.forEach((rackModule, index) => {
      const modulePosition = this.getModulePosition(index);
      this.renderContext.fillStyle = "#222222";
      this.renderContext.fillRect(
        modulePosition.x,
        modulePosition.y,
        modulePosition.x + rackModule.width,
        400,
      );
    });
  }

  renderCables(): void {

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
