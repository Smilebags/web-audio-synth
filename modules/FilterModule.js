import AbstractRackModule from "./AbstractRackModule.js";
import { distance } from "../util.js";
export default class FilterModule extends AbstractRackModule {
    constructor(context, { voltageOffset = Math.log2(440), }) {
        super();
        this.type = 'Filter';
        this.dials = [];
        this.paramValueOffset = null;
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.context = context;
        this.in = this.context.createGain();
        this.in.gain.value = 1;
        this.qIn = this.context.createConstantSource();
        this.qIn.offset.value = 0;
        this.qIn.start();
        this.lowpass = this.context.createBiquadFilter();
        this.lowpass.frequency.value = 0;
        this.lowpass.type = 'lowpass';
        this.highpass = this.context.createBiquadFilter();
        this.highpass.frequency.value = 0;
        this.highpass.type = 'highpass';
        this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
        this.voCoarseParam = this.vo.parameters.get('coarse');
        this.in.connect(this.lowpass);
        this.in.connect(this.highpass);
        this.vo.connect(this.lowpass.frequency);
        this.vo.connect(this.highpass.frequency);
        this.qIn.connect(this.lowpass.Q);
        this.qIn.connect(this.highpass.Q);
        this.addPlug(this.in, 'In', 'in', 0);
        if (this.voCoarseParam) {
            this.voCoarseParam.value = voltageOffset;
            this.addPlug(this.voCoarseParam, 'V/O In', 'in', 1);
        }
        this.addPlug(this.qIn.offset, 'Q', 'in', 2);
        this.addPlug(this.lowpass, 'Low', 'out', 3);
        this.addPlug(this.highpass, 'High', 'out', 4);
        if (this.voCoarseParam) {
            this.addDial({ x: 15, y: 100 }, 12, this.voCoarseParam);
        }
        this.addDial({ x: 15, y: 150 }, 12, this.qIn.offset);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
        this.addEventListener('mouseup', () => { this.handleMouseup(); });
    }
    addDial(pos, radius, param) {
        this.dials.push({ pos, radius, param });
    }
    handleMousedown(mousedownEvent) {
        const param = this.getParamFromPosition(mousedownEvent);
        if (!param) {
            return;
        }
        this.mousedownParam = param;
        this.mousedownPos = mousedownEvent;
        this.paramInitialValue = param.value;
    }
    handleMousemove(mousemoveEvent) {
        if (this.mousedownPos === null
            || this.mousedownParam === null
            || this.paramInitialValue === null) {
            return;
        }
        const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
        this.paramValueOffset = this.paramInitialValue + (relativeYPos / 2 ** 6);
        if (this.mousedownParam) {
            this.mousedownParam.value = this.paramValueOffset;
        }
    }
    handleMouseup() {
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
    }
    getParamFromPosition(pos) {
        const foundDial = this.dials.find((dial) => {
            return distance(dial.pos, pos) <= dial.radius;
        });
        if (!foundDial) {
            return null;
        }
        return foundDial.param;
    }
    render(renderContext) {
        super.render(renderContext);
        this.dials.forEach((dial) => this.renderDial(renderContext, dial.pos, dial.radius, dial.param.value, ''));
    }
    toParams() {
        return {
            type: this.type,
            voltageOffset: this.paramValueOffset,
        };
    }
}
