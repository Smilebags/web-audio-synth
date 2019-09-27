export default class SequencerButton {
    constructor(rack) {
        this.rack = rack;
        this.width = 32;
    }
    render(context) {
        context.save();
        context.fillStyle = '#9900ff';
        context.fillRect(8, 8, 16, 16);
        context.restore();
    }
    handlePress() {
        const newGain = this.rack.rackModuleFactory.createModule('Sequencer', {});
        this.rack.addModule(newGain);
    }
}
