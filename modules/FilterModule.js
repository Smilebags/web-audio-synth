import AbstractRackModule from "./AbstractRackModule.js";
import { subtract } from "../util.js";
export default class FilterModule extends AbstractRackModule {
    constructor(context, { voltageOffset = Math.log2(440), }) {
        super();
        this.type = 'Filter';
        this.initialVoltage = null;
        this.mousedownPos = null;
        this.mousemovePos = null;
        this.context = context;
        this.in = this.context.createGain();
        this.in.gain.value = 1;
        this.lowpass = this.context.createBiquadFilter();
        this.lowpass.frequency.value = 0;
        this.lowpass.type = 'lowpass';
        this.highpass = this.context.createBiquadFilter();
        this.highpass.frequency.value = 0;
        this.highpass.type = 'highpass';
        this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
        this.voltageOffset = voltageOffset;
        this.voCoarseParam = this.vo.parameters.get('coarse');
        if (this.voCoarseParam) {
            this.voCoarseParam.value = this.voltageOffset;
            this.addPlug(this.voCoarseParam, 'V/O In', 'in', 1);
        }
        this.in.connect(this.lowpass);
        this.in.connect(this.highpass);
        this.vo.connect(this.lowpass.frequency);
        this.vo.connect(this.highpass.frequency);
        this.addPlug(this.in, 'In', 'in', 0);
        this.addPlug(this.lowpass, 'Low', 'out', 2);
        this.addPlug(this.highpass, 'High', 'out', 3);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
    }
    handleMousedown(mousedownEvent) {
        if (!this.isInFreqBox(mousedownEvent)) {
            return;
        }
        this.mousedownPos = mousedownEvent;
        this.initialVoltage = this.voltageOffset;
    }
    handleMousemove(mousemoveEvent) {
        this.mousemovePos = mousemoveEvent;
        if (!this.mousedownPos || !this.initialVoltage) {
            return;
        }
        const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
        this.voltageOffset = this.initialVoltage + (relativeYPos / 2 ** 6);
        if (this.voCoarseParam) {
            this.voCoarseParam.value = this.voltageOffset;
        }
    }
    isInFreqBox(pos) {
        return pos.y >= 200;
    }
    toParams() {
        return {
            type: this.type,
            voltageOffset: this.voltageOffset,
        };
    }
}
