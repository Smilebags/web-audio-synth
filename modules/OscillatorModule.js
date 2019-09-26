import AbstractRackModule from "./AbstractRackModule.js";
import { subtract, displayFreq } from "../util.js";
export default class OscillatorModule extends AbstractRackModule {
    constructor(context, { oscType = 'sine', voltageOffset = Math.log2(440), }) {
        super();
        this.type = 'Oscillator';
        this.initialVoltage = null;
        this.mousedownPos = null;
        this.mousemovePos = null;
        this.context = context;
        this.osc = this.context.createOscillator();
        this.osc.frequency.value = 0;
        this.osc.type = oscType;
        this.osc.start();
        this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
        this.vo.connect(this.osc.frequency);
        this.voltageOffset = voltageOffset;
        this.voCoarseParam = this.vo.parameters.get('coarse');
        if (this.voCoarseParam) {
            this.voCoarseParam.value = this.voltageOffset;
            this.addPlug(this.voCoarseParam, 'V/O In', 'in', 0);
        }
        this.addLabel({
            getText: () => {
                if (!this.voCoarseParam) {
                    return '0';
                }
                return displayFreq(2 ** this.voCoarseParam.value);
            },
            position: { x: this.width / 2, y: 355 },
            align: 'center',
        });
        this.addPlug(this.osc, 'Out', 'out', 2);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
        this.addEventListener('mouseup', (e) => { this.handleMouseup(); });
    }
    handleMousedown(mousedownEvent) {
        if (this.isInModeSelectRegion(mousedownEvent)) {
            this.handleModeSelect(mousedownEvent);
            return;
        }
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
    handleMouseup() {
        this.mousemovePos = null;
        this.mousedownPos = null;
        this.initialVoltage = null;
    }
    isInModeSelectRegion(pos) {
        return pos.y > 200 && pos.y < 300;
    }
    handleModeSelect(pos) {
        if (pos.y < 200 || pos.y > 300) {
            return;
        }
        if (pos.y < 225) {
            this.osc.type = 'sine';
            return;
        }
        if (pos.y < 250) {
            this.osc.type = 'triangle';
            return;
        }
        if (pos.y < 275) {
            this.osc.type = 'sawtooth';
            return;
        }
        this.osc.type = 'square';
    }
    isInFreqBox(pos) {
        return pos.y >= 300;
    }
    render(renderContext) {
        this.renderModeButtons(renderContext);
        this.renderPitchWheel(renderContext);
        super.render(renderContext);
    }
    renderModeButtons(renderContext) {
        const padding = 5;
        renderContext.save();
        renderContext.fillStyle = '#aa6633';
        renderContext.fillRect(padding, 200 + padding, this.width - (2 * padding), 25 - padding);
        renderContext.fillRect(padding, 225 + padding, this.width - (2 * padding), 25 - padding);
        renderContext.fillRect(padding, 250 + padding, this.width - (2 * padding), 25 - padding);
        renderContext.fillRect(padding, 275 + padding, this.width - (2 * padding), 25 - padding);
        renderContext.restore();
    }
    renderPitchWheel(renderContext) {
        renderContext.save();
        renderContext.fillStyle = '#303030';
        renderContext.beginPath();
        renderContext.arc(this.width / 2, 350, 40, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.strokeStyle = '#404040';
        renderContext.lineWidth = 4;
        renderContext.beginPath();
        renderContext.moveTo(this.width / 2, 350);
        const offset = {
            x: Math.sin(this.voltageOffset) * 40,
            y: Math.cos(this.voltageOffset) * 40,
        };
        renderContext.lineTo((this.width / 2) + offset.x, 350 - offset.y);
        renderContext.stroke();
        renderContext.restore();
    }
    toParams() {
        return {
            type: this.type,
            oscType: this.osc.type,
            voltageOffset: this.voltageOffset,
        };
    }
}
