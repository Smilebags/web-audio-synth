import Plug from "./Plug.js";
import { add, distance } from "./util/Vec2Math.js";
import Rack from "./Rack.js";
import { Vec2 } from "./types/Vec2.js";

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
export default class Cable {
  color: string;
  isConnected: boolean = true;

  plug1: Plug;
  plug2: Plug;

  constructor(
    public rack: Rack,
    plug1: Plug,
    plug2: Plug,
    private cableSlack = 30,
  ) {
    this.color = getRandomColor();
    if(plug1.type === plug2.type) {
      throw 'Cannot create a cable between two plugs of the same type';
    }
    if (plug1.type === 'out') {
      this.plug1 = plug1;
      this.plug2 = plug2;
    } else {
      this.plug1 = plug2;
      this.plug2 = plug1;
    }
    this.plug1.connect(this.plug2);
  }

  renderEnds(renderContext: CanvasRenderingContext2D): void {
    const startPosition = add(
      this.rack.getModuleRackPosition(this.plug1.module),
      this.plug1.position,
    );
    const endPosition = add(
      this.rack.getModuleRackPosition(this.plug2.module),
      this.plug2.position,
    );
    renderContext.fillStyle = this.color;
    renderContext.beginPath();
    renderContext.arc(startPosition.x, startPosition.y, this.plug1.radius-2, 0, 2 * Math.PI);
    renderContext.arc(endPosition.x, endPosition.y, this.plug2.radius-2, 0, 2 * Math.PI);
    renderContext.fill();
  }

  renderCord(
    renderContext: CanvasRenderingContext2D,
    pos1: Vec2,
    pos2: Vec2,
    cableSlack: number,
  ) {
    renderContext.beginPath();
    renderContext.strokeStyle = this.color;
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

  render(renderContext: CanvasRenderingContext2D): void {
    if (!this.isConnected) {
      return;
    }
    this.renderEnds(renderContext);
    const plug1ModulePos = this.rack.getModuleRackPosition(this.plug1.module);
    const plug1RackPos = add(plug1ModulePos, this.plug1.position);
    const plug2ModulePos = this.rack.getModuleRackPosition(this.plug2.module);
    const plug2RackPos = add(plug2ModulePos, this.plug2.position);

    const cableLength = distance(plug1RackPos, plug2RackPos);
    const cableSlack = cableLength * (this.cableSlack / 100);

    this.renderCord(renderContext, plug1RackPos, plug2RackPos, cableSlack);
  }

  remove() {
    this.plug1.disconnect(this.plug2);
    this.isConnected = false;
  }
}