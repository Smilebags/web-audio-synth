import AbstractRackModule from "./AbstractRackModule.js";
export default class VoltageQuantizerModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.name = 'Quantizer';
        this.type = 'VoltageQuantizer';
        this.context = context;
        this.quantizer = new AudioWorkletNode(this.context, 'voltage-quantizer-processor');
        this.addPlug(this.quantizer, 'In', 'in', 0);
        this.addPlug(this.quantizer, 'Out', 'out', 1);
        this.addDefaultEventListeners();
    }
}
