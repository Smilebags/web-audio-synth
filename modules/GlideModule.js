import AbstractRackModule from "./AbstractRackModule.js";
export default class GlideModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.context = context;
        this.type = 'Glide';
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.paramValueOffset = null;
        this.glideWorklet = new AudioWorkletNode(this.context, 'glide-processor');
        this.addPlug(this.glideWorklet, 'In', 'in');
        this.glideAmountParam = this.glideWorklet.parameters.get('glideAmount');
        this.addDialPlugAndLabel(this.glideAmountParam, this.glideAmountParam, 'Amount', 'in', () => this.glideAmountParam.value.toFixed(2));
        this.addPlug(this.glideWorklet, 'Out', 'out');
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
        };
    }
}
