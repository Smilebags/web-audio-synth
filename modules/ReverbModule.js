import AbstractRackModule from "./AbstractRackModule.js";
const getImpulseBuffer = (audioContext, impulseUrl) => {
    return fetch(impulseUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
};
export default class ReverbModule extends AbstractRackModule {
    constructor(context) {
        super();
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
        this.mousedownPos = null;
        this.mousemovePos = null;
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
        // this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
        // this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    }
    // handleMousedown(mousedownEvent: Vec2): void {
    //   if (!this.isInFreqBox(mousedownEvent)) {
    //     return;
    //   }
    //   this.mousedownPos = mousedownEvent;
    // }
    // handleMousemove(mousemoveEvent: Vec2): void {
    //   this.mousemovePos = mousemoveEvent;
    //   if (!this.mousedownPos || !this.initialDelay) {
    //     return;
    //   }
    //   const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    //   this.reverb.delayTime.value = this.initialDelay + (relativeYPos / 2**6 );
    // }
    // isInFreqBox(pos: Vec2): boolean {
    //   return pos.y >= 200;
    // }
    toParams() {
        return {
            type: this.type,
        };
    }
}
