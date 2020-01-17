import AbstractRackModule from "./AbstractRackModule.js";
const getImpulseBuffer = (audioContext, impulseUrl) => {
    return fetch(impulseUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
};
export default class ReverbModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Reverb';
        this.reverbs = [];
        this.impulseResponseUrls = [
            'static/Basement.m4a',
            'static/ErrolBrickworksKiln.m4a',
            'static/ElvedenHallLordsCloakroom.m4a',
            'static/ElvedenHallMarbleHall.m4a',
        ];
        this.reverbNames = [
            'Tiny',
            'Small',
            'Big',
            'Huge',
        ];
        this.context = context;
        this.in = this.context.createGain();
        this.addPlug(this.in, 'In', 'in', 0);
        this.impulseResponseUrls.forEach((impulseResponseUrl, index) => {
            this.reverbs[index] = this.context.createConvolver();
            getImpulseBuffer(context, impulseResponseUrl).then((arrayBuffer) => {
                this.reverbs[index].buffer = arrayBuffer;
                this.addPlug(this.reverbs[index], this.reverbNames[index], 'out', index + 1);
                this.in.connect(this.reverbs[index]);
            });
        });
    }
}
