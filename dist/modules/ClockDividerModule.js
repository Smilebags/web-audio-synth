import AbstractRackModule from "./AbstractRackModule.js";
export default class ClockDividerModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'ClockDivider';
        this.context = context;
        this.divider = new AudioWorkletNode(this.context, 'clock-divider-processor', { numberOfOutputs: 6 });
        this.div2 = this.context.createGain();
        this.div4 = this.context.createGain();
        this.div8 = this.context.createGain();
        this.div16 = this.context.createGain();
        this.div32 = this.context.createGain();
        this.div64 = this.context.createGain();
        this.divider.connect(this.div2, 0);
        this.divider.connect(this.div4, 1);
        this.divider.connect(this.div8, 2);
        this.divider.connect(this.div16, 3);
        this.divider.connect(this.div32, 4);
        this.divider.connect(this.div64, 5);
        this.addPlug({ param: this.divider, name: 'In', type: 'in' });
        const resetTriggerParam = this.divider.parameters.get('resetTrigger');
        this.addPlug({ param: resetTriggerParam, name: 'Reset', type: 'in' });
        this.addPlug({ param: this.div2, name: '/2', type: 'out' });
        this.addPlug({ param: this.div4, name: '/4', type: 'out' });
        this.addPlug({ param: this.div8, name: '/8', type: 'out' });
        this.addPlug({ param: this.div16, name: '/16', type: 'out' });
        this.addPlug({ param: this.div32, name: '/32', type: 'out' });
        this.addPlug({ param: this.div64, name: '/64', type: 'out' });
    }
}
