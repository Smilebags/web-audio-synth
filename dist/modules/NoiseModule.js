import AbstractRackModule from "./AbstractRackModule.js";
export default class NoiseModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Noise';
        this.context = context;
        this.noise = new AudioWorkletNode(this.context, 'noise-processor');
        this.addPlug({ param: this.noise, name: 'White', type: 'out' });
    }
}
