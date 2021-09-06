import AbstractRackModule from "./AbstractRackModule.js";
export default class EnvelopeModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Envelope';
        const { a = 0.01 } = params;
        const { d = 0.05 } = params;
        const { s = 0.5 } = params;
        const { r = 0.2 } = params;
        this.context = context;
        this.envelope = new AudioWorkletNode(this.context, 'envelope-generator-processor');
        this.addPlug({ param: this.envelope, name: 'Trigger', type: 'in', order: 0 });
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
        this.addPlug({ param: this.envelope, name: 'Out', type: 'out', order: 5 });
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            a: this.envelopeAttackParam.value,
            d: this.envelopeDecayParam.value,
            s: this.envelopeSustainParam.value,
            r: this.envelopeReleaseParam.value,
        };
    }
}
