import AbstractRackModule from "./AbstractRackModule.js";
export default class DistortionModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Distortion';
        const { distortionAmount = 4 } = params;
        this.context = context;
        this.waveshaper = this.context.createWaveShaper();
        this.waveshaperCurve = new Float32Array(this.context.sampleRate);
        this.updateWaveshaperCurve(distortionAmount);
        this.distortionAmount = distortionAmount;
        this.waveshaper.curve = this.waveshaperCurve;
        this.addPlug(this.waveshaper, 'In', 'in');
        this.addPlug(this.waveshaper, 'Out', 'out');
        this.addDefaultEventListeners();
    }
    updateWaveshaperCurve(amount) {
        this.makeDistortionCurve(amount * 25);
        // for (let i = 0; i < this.waveshaperCurve.length; i++) {
        //   const progress = i / this.waveshaperCurve.length;
        //   this.waveshaperCurve[i] = progress ** (1 / amount);
        // }
    }
    makeDistortionCurve(amount = 50) {
        const sampleCount = this.context.sampleRate;
        const curve = this.waveshaperCurve;
        let deg = Math.PI / 180;
        let x;
        for (let i = 0; i < sampleCount; ++i) {
            x = i * 2 / sampleCount - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }
        // return curve;
    }
    ;
    toParams() {
        return {
            ...super.toParams(),
            distortionAmount: this.distortionAmount,
        };
    }
}
