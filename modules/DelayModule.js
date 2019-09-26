import AbstractRackModule from "./AbstractRackModule.js";
import { subtract } from "../util.js";
export default class DelayModule extends AbstractRackModule {
    constructor(context, { startingDelay = 0.2 }) {
        super();
        this.type = 'Delay';
        this.initialDelay = 0;
        this.mousedownPos = null;
        this.mousemovePos = null;
        this.context = context;
        this.delay = this.context.createDelay();
        this.delay.delayTime.value = startingDelay;
        this.addPlug(this.delay, 'In', 'in', 0);
        this.addPlug(this.delay.delayTime, 'Delay Time', 'in', 1);
        this.addPlug(this.delay, 'Out', 'out', 2);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
    }
    handleMousedown(mousedownEvent) {
        if (!this.isInFreqBox(mousedownEvent)) {
            return;
        }
        this.mousedownPos = mousedownEvent;
        this.initialDelay = this.delay.delayTime.value;
    }
    handleMousemove(mousemoveEvent) {
        this.mousemovePos = mousemoveEvent;
        if (!this.mousedownPos || !this.initialDelay) {
            return;
        }
        const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
        this.delay.delayTime.value = this.initialDelay + (relativeYPos / 2 ** 6);
    }
    isInFreqBox(pos) {
        return pos.y >= 200;
    }
    toParams() {
        return {
            type: this.type,
            startingDelay: this.delay.delayTime.value,
        };
    }
}
