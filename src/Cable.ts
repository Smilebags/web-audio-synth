import Plug from "./Plug.js";
import { add } from "./util.js";
import Rack from "./Rack.js";

export default class Cable {
  constructor(public rack: Rack, private plug1: Plug, private plug2: Plug) {
  }
  render(renderContext: CanvasRenderingContext2D): void {
    const plug1ModulePos = this.rack.getModulePosition(this.plug1.module);
    const plug1RackPos = add(plug1ModulePos, this.plug1.position);
    const plug2ModulePos = this.rack.getModulePosition(this.plug2.module);
    const plug2RackPos = add(plug2ModulePos, this.plug2.position);

    renderContext.beginPath();
    renderContext.strokeStyle = '#ff8800';
    renderContext.lineWidth = 4;
    renderContext.moveTo(plug1RackPos.x, plug1RackPos.y);
    renderContext.lineTo(plug2RackPos.x, plug2RackPos.y);
    renderContext.stroke();
  }
}