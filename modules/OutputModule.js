import AbstractRackModule from "./AbstractRackModule.js";
export default class OutputModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = 'Output';
        this.context = context;
        this.addPlug(this.context.destination, '', 'in');
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
