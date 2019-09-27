export default class EnvelopeButton {
    constructor(rack) {
        this.rack = rack;
        this.width = 32;
    }
    render(context) {
        context.save();
        context.fillStyle = '#99ff00';
        context.fillRect(8, 8, 16, 16);
        context.restore();
    }
    handlePress() {
        const newGain = this.rack.rackModuleFactory.createModule('Envelope', {});
        this.rack.addModule(newGain);
    }
}
