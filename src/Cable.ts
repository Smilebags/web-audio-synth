import Plug from "./Plug.js";
import { add, distance } from "./util.js";
import Rack from "./Rack.js";

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
  constructor(
    public rack: Rack,
    public plug1: Plug,
    public plug2: Plug,
    private cableSlack = 30,
  ) {
    this.color = getRandomColor();
    this.plug1.connect(this.plug2);
  }

  render(renderContext: CanvasRenderingContext2D): void {
    if (!this.isConnected) {
      return;
    }
    const plug1ModulePos = this.rack.getModulePosition(this.plug1.module);
    const plug1RackPos = add(plug1ModulePos, this.plug1.position);
    const plug2ModulePos = this.rack.getModulePosition(this.plug2.module);
    const plug2RackPos = add(plug2ModulePos, this.plug2.position);

    const cableLength = distance(plug1RackPos, plug2RackPos);
    const cableSlack = cableLength * (this.cableSlack / 100);

    renderContext.beginPath();
    renderContext.strokeStyle = this.color;
    renderContext.lineCap = 'round';
    renderContext.lineWidth = 4;
    renderContext.moveTo(plug1RackPos.x, plug1RackPos.y);
    renderContext.bezierCurveTo(
      plug1RackPos.x,
      plug1RackPos.y + cableSlack,
      plug2RackPos.x,
      plug2RackPos.y + cableSlack,
      plug2RackPos.x,
      plug2RackPos.y,
    );
    renderContext.stroke();
  }

  remove() {
    this.plug1.disconnect(this.plug2);
    this.isConnected = false;
  }
}