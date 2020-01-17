import AbstractRackModule from "./AbstractRackModule.js";
export default class OscillatorModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Gain';
        const { gain = 1 } = params;
        this.context = context;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = gain;
        this.addPlug(this.gainNode, 'In', 'in');
        this.addDialPlugAndLabel(this.gainNode.gain, this.gainNode.gain, 'VC', 'in', () => this.gainNode.gain.value.toFixed(2));
        this.addPlug(this.gainNode, 'Out', 'out');
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            gain: this.gainNode.gain.value,
        };
    }
}
