import { add, distance } from "./util.js";
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export default class Cable {
    constructor(rack, plug1, plug2, cableSlack = 30) {
        this.rack = rack;
        this.plug1 = plug1;
        this.plug2 = plug2;
        this.cableSlack = cableSlack;
        this.isConnected = true;
        this.color = getRandomColor();
        this.plug1.connect(this.plug2);
    }
    render(renderContext) {
        if (!this.isConnected) {
            return;
        }
        const plug1ModulePos = this.rack.getModuleRackPosition(this.plug1.module);
        const plug1RackPos = add(plug1ModulePos, this.plug1.position);
        const plug2ModulePos = this.rack.getModuleRackPosition(this.plug2.module);
        const plug2RackPos = add(plug2ModulePos, this.plug2.position);
        const cableLength = distance(plug1RackPos, plug2RackPos);
        const cableSlack = cableLength * (this.cableSlack / 100);
        renderContext.beginPath();
        renderContext.strokeStyle = this.color;
        renderContext.lineCap = 'round';
        renderContext.lineWidth = 4;
        renderContext.moveTo(plug1RackPos.x, plug1RackPos.y);
        renderContext.bezierCurveTo(plug1RackPos.x, plug1RackPos.y + cableSlack, plug2RackPos.x, plug2RackPos.y + cableSlack, plug2RackPos.x, plug2RackPos.y);
        renderContext.stroke();
    }
    remove() {
        this.plug1.disconnect(this.plug2);
        this.isConnected = false;
    }
}
