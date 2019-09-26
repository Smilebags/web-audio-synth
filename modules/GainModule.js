import AbstractRackModule from "./AbstractRackModule.js";
import { subtract } from '../util.js';
export default class OscillatorModule extends AbstractRackModule {
    constructor(context, { gain = 1, }) {
        super();
        this.type = 'Gain';
        this.initialGain = null;
        this.mousedownPos = null;
        this.mousemovePos = null;
        this.context = context;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = gain;
        this.addLabel({
            getText: () => {
                const gain = this.gainNode.gain.value;
                return String(gain.toFixed(2));
            },
            position: { x: 5, y: 105 },
        });
        this.addPlug(this.gainNode, 'In', 'in');
        this.addPlug(this.gainNode.gain, 'VC', 'in');
        this.addPlug(this.gainNode, 'Out', 'out');
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
    }
    handleMousedown(mousedownEvent) {
        if (!this.isInVolumeBox(mousedownEvent)) {
            return;
        }
        this.mousedownPos = mousedownEvent;
        this.initialGain = this.gainNode.gain.value;
    }
    handleMousemove(mousemoveEvent) {
        this.mousemovePos = mousemoveEvent;
        if (!this.mousedownPos || this.initialGain === null) {
            return;
        }
        const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
        this.gainNode.gain.value = this.initialGain + (relativeYPos * 0.02);
    }
    isInVolumeBox(pos) {
        return pos.y >= 200;
    }
    toParams() {
        return {
            type: this.type,
            gain: this.gainNode.gain.value,
        };
    }
}
