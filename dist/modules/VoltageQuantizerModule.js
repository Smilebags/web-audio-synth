import AbstractRackModule from "./AbstractRackModule.js";
export default class VoltageQuantizerModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.name = 'Quantizer';
        this.type = 'VoltageQuantizer';
        this.context = context;
        this.quantizer = new AudioWorkletNode(this.context, 'voltage-quantizer-processor');
        this.addPlug({ param: this.quantizer, name: 'In', type: 'in', order: 0 });
        this.addPlug({ param: this.quantizer, name: 'Out', type: 'out', order: 1 });
        this.addDefaultEventListeners();
    }
}
