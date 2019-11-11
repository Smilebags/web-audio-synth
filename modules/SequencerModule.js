import AbstractRackModule from "./AbstractRackModule.js";
export default class SequencerModule extends AbstractRackModule {
    constructor(context, { stepCount = 16, tickInterval = 200, }) {
        super();
        this.type = 'Sequencer';
        this.buttonSize = 16;
        this.topOffset = 30;
        this.buttonInterval = 18;
        this.context = context;
        this.states = [];
        this.currentIndex = 0;
        this.lowVoltage = 0;
        this.highVoltage = 1;
        this.tickInterval = tickInterval;
        this.voltageNode = this.context.createConstantSource();
        this.voltageNode.offset.value = 0;
        this.voltageNode.start();
        for (let i = 0; i < stepCount; i++) {
            this.states.push(false);
        }
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        setInterval(() => this.tick(), this.tickInterval);
        this.addPlug(this.voltageNode, 'Out', 'out', 6);
    }
    handleMousedown(mousedownPosition) {
        const selectedButtonIndex = this.getCollidedButtonIndex(mousedownPosition);
        if (selectedButtonIndex !== -1) {
            this.states[selectedButtonIndex] = !this.states[selectedButtonIndex];
        }
    }
    get buttonCount() {
        return this.states.length;
    }
    getButtonPositionByIndex(index) {
        // if (this.buttonCount <= 16) {
        //   return {
        //     x: (this.width / 2) - (this.buttonSize / 2),
        //     y: this.topOffset + (index * this.buttonInterval),
        //   };
        // }
        const rowCount = Math.ceil(this.buttonCount / 16);
        const rowNumber = index % rowCount;
        const columnNumber = Math.floor(index / rowCount);
        const xPosition = (this.width / 2)
            - ((rowCount * this.buttonInterval) / 2)
            + (rowNumber * this.buttonInterval);
        const yPosition = this.topOffset + (columnNumber * this.buttonInterval);
        return {
            x: xPosition,
            y: yPosition,
        };
    }
    getCollidedButtonIndex(pos) {
        return this.states.findIndex((state, index) => {
            const buttonPos = this.getButtonPositionByIndex(index);
            return buttonPos.x < pos.x
                && (buttonPos.x + this.buttonSize) > pos.x
                && buttonPos.y < pos.y
                && (buttonPos.y + this.buttonSize) > pos.y;
        });
    }
    tick() {
        this.currentIndex = (this.currentIndex + 1) % this.buttonCount;
        if (this.states[this.currentIndex]) {
            this.voltageNode.offset.value = this.highVoltage;
        }
        else {
            this.voltageNode.offset.value = this.lowVoltage;
        }
    }
    render(renderContext) {
        super.render(renderContext);
        this.states.forEach((state, index) => {
            renderContext.fillStyle = state ? '#A04040' : '#444040';
            if (this.currentIndex === index) {
                renderContext.fillStyle = state ? '#F04040' : '#A04040';
            }
            const buttonPos = this.getButtonPositionByIndex(index);
            renderContext.fillRect(buttonPos.x, buttonPos.y, this.buttonSize, this.buttonSize);
        });
    }
    toParams() {
        return {
            type: this.type,
            stepCount: this.states.length,
            tickInterval: this.tickInterval,
        };
    }
}
