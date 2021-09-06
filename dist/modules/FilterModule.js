import AbstractRackModule from "./AbstractRackModule.js";
import { displayFreq } from "../util/util.js";
export default class FilterModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Filter';
        const { voltageOffset = Math.log2(440) } = params;
        const { qOffset = 0 } = params;
        this.context = context;
        this.in = this.context.createGain();
        this.in.gain.value = 1;
        this.qIn = this.context.createConstantSource();
        this.qIn.offset.value = qOffset;
        this.qIn.start();
        this.lowpass = this.context.createBiquadFilter();
        this.lowpass.frequency.value = 0;
        this.lowpass.type = 'lowpass';
        this.highpass = this.context.createBiquadFilter();
        this.highpass.frequency.value = 0;
        this.highpass.type = 'highpass';
        this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
        this.voCoarseParam = this.vo.parameters.get('coarse');
        this.voCoarseParam.value = voltageOffset;
        this.in.connect(this.lowpass);
        this.in.connect(this.highpass);
        this.vo.connect(this.lowpass.frequency);
        this.vo.connect(this.highpass.frequency);
        this.qIn.connect(this.lowpass.Q);
        this.qIn.connect(this.highpass.Q);
        this.addPlug({ param: this.in, name: 'In', type: 'in' });
        this.addDialPlugAndLabel(this.voCoarseParam, this.voCoarseParam, 'V/O In', 'in', () => displayFreq(2 ** this.voCoarseParam.value));
        this.addDialPlugAndLabel(this.qIn.offset, this.qIn.offset, 'Q', 'in', () => this.qIn.offset.value.toFixed(2));
        this.addPlug({ param: this.lowpass, name: 'Low', type: 'out', order: 3 });
        this.addPlug({ param: this.highpass, name: 'High', type: 'out', order: 4 });
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            voltageOffset: this.voCoarseParam.value,
            qOffset: this.qIn.offset.value,
        };
    }
}
