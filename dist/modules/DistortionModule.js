import AbstractRackModule from "./AbstractRackModule.js";
export default class DistortionModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Distortion';
        const { distortionAmount = 4 } = params;
        this.context = context;
        this.distortionAmount = this.context.createConstantSource();
        this.distortionAmount.offset.value = distortionAmount;
        this.distortionAmount.start();
        this.distortionNode = new AudioWorkletNode(this.context, 'distortion-processor');
        const distortionIn = this.distortionNode.parameters.get('bInput');
        this.distortionAmount.connect(distortionIn);
        this.addPlug({ param: this.distortionNode, name: 'In', type: 'in' });
        this.addDialPlugAndLabel(this.distortionAmount.offset, this.distortionAmount.offset, 'Drive', 'in', () => this.distortionAmount.offset.value.toFixed(2));
        this.addPlug({ param: this.distortionNode, name: 'Out', type: 'out' });
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            distortionAmount: this.distortionAmount.offset.value,
        };
    }
}
