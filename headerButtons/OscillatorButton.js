export default class OscillatorButton {
    constructor(rack) {
        this.rack = rack;
        this.width = 32;
    }
    render(context) {
        context.drawImage(
        // @ts-ignore
        window.oscImage, 0, 0, this.width, this.width);
    }
    handlePress() {
        const newOscillator = this.rack.rackModuleFactory.createModule('Oscillator', {});
        this.rack.addModule(newOscillator);
    }
}
