import AbstractRackModule from "./AbstractRackModule.js";
export default class ClockDividerModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = 'ClockDivider';
        this.context = context;
        this.divider = new AudioWorkletNode(this.context, 'clock-divider-processor', { numberOfOutputs: 4 });
        this.div2 = this.context.createGain();
        this.div4 = this.context.createGain();
        this.div8 = this.context.createGain();
        this.div16 = this.context.createGain();
        this.divider.connect(this.div2, 0);
        this.divider.connect(this.div4, 1);
        this.divider.connect(this.div8, 2);
        this.divider.connect(this.div16, 3);
        this.addPlug(this.divider, 'In', 'in');
        const resetTriggerParam = this.divider.parameters.get('resetTrigger');
        if (resetTriggerParam) {
            this.addPlug(resetTriggerParam, 'Reset', 'in');
        }
        this.addPlug(this.div2, '/2', 'out');
        this.addPlug(this.div4, '/4', 'out');
        this.addPlug(this.div8, '/8', 'out');
        this.addPlug(this.div16, '/16', 'out');
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
