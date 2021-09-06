import AbstractRackModule from "./AbstractRackModule.js";
export default class DelayModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Delay';
        const { delay = 0 } = params;
        this.context = context;
        this.delay = this.context.createDelay();
        this.delay.delayTime.value = delay;
        this.addPlug({ param: this.delay, name: 'In', type: 'in' });
        this.addDialPlugAndLabel(this.delay.delayTime, this.delay.delayTime, 'Delay Time', 'in', () => this.delay.delayTime.value.toFixed(2));
        this.addPlug({ param: this.delay, name: 'Out', type: 'out' });
        this.addDefaultEventListeners();
    }
    toParams() {
        return {
            ...super.toParams(),
            delay: this.delay.delayTime.value,
        };
    }
}
