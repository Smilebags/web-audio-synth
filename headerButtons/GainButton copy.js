export default class GainButton {
    constructor(rack) {
        this.rack = rack;
        this.width = 32;
    }
    render(context) {
        context.save();
        context.fillStyle = '#ff9900';
        context.fillRect(8, 8, 16, 16);
        context.restore();
    }
    handlePress() {
        const newGain = this.rack.rackModuleFactory.createModule('Gain', {});
        this.rack.addModule(newGain);
    }
}
