import AbstractRackModule from "./AbstractRackModule.js";
export default class ValuesModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = 'Values';
        this.valuesNodes = [];
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.context = context;
        for (let i = 0; i < 8; i++) {
            const constantSourceNode = this.context.createConstantSource();
            constantSourceNode.offset.value = 0;
            constantSourceNode.start();
            this.valuesNodes.push(constantSourceNode);
            this.addDialPlugAndLabel(this.valuesNodes[i], this.valuesNodes[i].offset, String(i + 1), 'out', () => this.valuesNodes[i].offset.value.toFixed(2));
        }
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
        this.addEventListener('mouseup', () => { this.handleMouseup(); });
    }
    handleMousedown(pos) {
        const dialParam = this.getDialParamFromPosition(pos);
        if (!dialParam) {
            return;
        }
        this.mousedownParam = dialParam;
        this.paramInitialValue = dialParam.value;
        this.mousedownPos = pos;
    }
    handleMousemove(mousemoveEvent) {
        if (this.mousedownPos === null
            || this.mousedownParam === null
            || this.paramInitialValue === null) {
            return;
        }
        const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
        if (this.mousedownParam) {
            this.mousedownParam.value = this.paramInitialValue + (relativeYPos / 2 ** 6);
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
