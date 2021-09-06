import AbstractRackModule from "./AbstractRackModule.js";
export default class AmplitudeModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.context = context;
        this.type = 'Amplitude';
        this.amplitudeWorklet = new AudioWorkletNode(this.context, 'amplitude-processor');
        this.addPlug({ param: this.amplitudeWorklet, name: 'In', type: 'in' });
        this.addPlug({ param: this.amplitudeWorklet, name: 'Out', type: 'out' });
        this.addDefaultEventListeners();
    }
}
