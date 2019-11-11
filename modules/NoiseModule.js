import AbstractRackModule from "./AbstractRackModule.js";
export default class NoiseModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = 'Noise';
        this.context = context;
        this.noise = new AudioWorkletNode(this.context, 'noise-processor');
        this.addPlug(this.noise, 'White', 'out');
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
