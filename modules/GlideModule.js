import AbstractRackModule from "./AbstractRackModule.js";
export default class GlideModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.context = context;
        this.type = 'Glide';
        const glideAmount = params.glideAmount || 0;
        this.glideWorklet = new AudioWorkletNode(this.context, 'glide-processor');
        this.addPlug(this.glideWorklet, 'In', 'in');
        this.glideAmountParam = this.glideWorklet.parameters.get('glideAmount');
        this.glideAmountParam.value = glideAmount;
        this.addDialPlugAndLabel(this.glideAmountParam, this.glideAmountParam, 'Amount', 'in', () => this.glideAmountParam.value.toFixed(2));
        this.addPlug(this.glideWorklet, 'Out', 'out');
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            glideAmount: this.glideAmountParam.value,
        };
    }
}
