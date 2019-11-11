import AbstractRackModule from "./AbstractRackModule.js";
export default class DelayModule extends AbstractRackModule {
    constructor(context, { startingDelay = 0.2 }) {
        super();
        this.type = 'Delay';
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.paramValueOffset = null;
        this.context = context;
        this.delay = this.context.createDelay();
        this.delay.delayTime.value = startingDelay;
        this.addPlug(this.delay, 'In', 'in');
        this.addDialPlugAndLabel(this.delay.delayTime, this.delay.delayTime, 'Delay Time', 'in', () => this.delay.delayTime.value.toFixed(2));
        this.addPlug(this.delay, 'Out', 'out');
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
        this.addEventListener('mouseup', () => { this.handleMouseup(); });
    }
    handleMousedown(mousedownEvent) {
        const param = this.getDialParamFromPosition(mousedownEvent);
        if (!param) {
            return;
        }
        this.mousedownParam = param;
        this.mousedownPos = mousedownEvent;
        this.paramInitialValue = param.value;
    }
    handleMousemove(mousemoveEvent) {
        if (this.mousedownPos === null
            || this.mousedownParam === null
            || this.paramInitialValue === null) {
            return;
        }
        const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
        this.paramValueOffset = this.paramInitialValue + (relativeYPos / 2 ** 6);
        if (this.mousedownParam) {
            this.mousedownParam.value = this.paramValueOffset;
        }
    }
    handleMouseup() {
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
    }
    toParams() {
        return {
            type: this.type,
            startingDelay: this.delay.delayTime.value,
        };
    }
}
