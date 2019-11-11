import AbstractRackModule from "./AbstractRackModule.js";
export default class EnvelopeModule extends AbstractRackModule {
    constructor(context, { a = 0.01, d = 0.2, s = 1, r = 0.2, }) {
        super();
        this.type = 'Envelope';
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.paramValueOffset = null;
        this.context = context;
        this.envelope = new AudioWorkletNode(this.context, 'envelope-generator-processor');
        this.addPlug(this.envelope, 'Trigger', 'in', 0);
        this.envelopeAttackParam = this.envelope.parameters.get('a');
        this.envelopeAttackParam.value = a;
        this.addDialPlugAndLabel(this.envelopeAttackParam, this.envelopeAttackParam, 'A', 'in', () => this.envelopeAttackParam.value.toFixed(2));
        this.envelopeDecayParam = this.envelope.parameters.get('d');
        this.envelopeDecayParam.value = d;
        this.addDialPlugAndLabel(this.envelopeDecayParam, this.envelopeDecayParam, 'D', 'in', () => this.envelopeDecayParam.value.toFixed(2));
        this.envelopeSustainParam = this.envelope.parameters.get('s');
        this.envelopeSustainParam.value = s;
        this.addDialPlugAndLabel(this.envelopeSustainParam, this.envelopeSustainParam, 'S', 'in', () => this.envelopeSustainParam.value.toFixed(2));
        this.envelopeReleaseParam = this.envelope.parameters.get('r');
        this.envelopeReleaseParam.value = r;
        this.addDialPlugAndLabel(this.envelopeReleaseParam, this.envelopeReleaseParam, 'R', 'in', () => this.envelopeReleaseParam.value.toFixed(2));
        this.addPlug(this.envelope, 'Out', 'out', 5);
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
            a: this.envelopeAttackParam.value,
            d: this.envelopeDecayParam.value,
            s: this.envelopeSustainParam.value,
            r: this.envelopeReleaseParam.value,
        };
    }
}
