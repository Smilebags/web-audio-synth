import AbstractRackModule from "./AbstractRackModule.js";
import { subtract } from "../util.js";
export default class OscillatorModule extends AbstractRackModule {
    constructor(context, type = 'sine', startingFrequency = 440) {
        super();
        this.name = 'Osc';
        this.initialFreq = null;
        this.mousedownPos = null;
        this.mousemovePos = null;
        this.context = context;
        this.osc = this.context.createOscillator();
        this.osc.frequency.value = startingFrequency;
        this.osc.type = type;
        this.osc.start();
        this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
        this.vo.connect(this.osc.frequency);
        this.addPlug(this.vo, 'V/O In', 'in', 0);
        this.addPlug(this.osc, 'Out', 'out', 2);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
    }
    handleMousedown(mousedownEvent) {
        if (!this.isInFreqBox(mousedownEvent)) {
            return;
        }
        this.mousedownPos = mousedownEvent;
        this.initialFreq = this.osc.frequency.value;
    }
    handleMousemove(mousemoveEvent) {
        this.mousemovePos = mousemoveEvent;
        if (!this.mousedownPos || !this.initialFreq) {
            return;
        }
        const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
        this.osc.frequency.value = this.initialFreq + (relativeYPos * 2);
    }
    isInFreqBox(pos) {
        return pos.y >= 200;
    }
}
