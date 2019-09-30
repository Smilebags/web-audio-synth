import AbstractRackModule from "./AbstractRackModule.js";
import { distance } from "../util.js";
export default class VoltageSequencer extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = 'VoltageSequencer';
        this.name = 'Sequencer';
        this.currentIndex = 0;
        this.topOffset = 40;
        this.dialSpread = 24;
        this.dialSize = 10;
        this.mousedownPos = null;
        this.mousedownDialIndex = null;
        this.mousedownDialInitialValue = null;
        this.context = context;
        this.noopGain = this.context.createGain();
        this.noopGain.gain.value = 0;
        this.noopGain.connect(this.context.destination);
        this.sequencerProcessor = new AudioWorkletNode(this.context, 'sequencer-processor');
        this.sequencerProcessor.port.onmessage = (message) => this.handleSequencerProcessorMessage(message);
        this.sequencerProcessor.connect(this.noopGain);
        this.levels = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ];
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (mousemovePos) => this.handleMousemove(mousemovePos));
        this.addEventListener('mouseup', (mouseupPos) => this.handleMouseup(mouseupPos));
        this.addPlug(this.sequencerProcessor, 'Step', 'in', 4);
        const resetTriggerParam = this.sequencerProcessor.parameters.get('resetTrigger');
        if (resetTriggerParam) {
            this.addPlug(resetTriggerParam, 'Reset', 'in', 5);
        }
        this.addPlug(this.sequencerProcessor, 'Out', 'out', 6);
    }
    handleMousedown(mousedownPosition) {
        const selectedDialIndex = this.getCollidedDialIndex(mousedownPosition);
        if (selectedDialIndex === -1) {
            return;
        }
        this.mousedownPos = mousedownPosition;
        this.mousedownDialIndex = selectedDialIndex;
        this.mousedownDialInitialValue = this.levels[selectedDialIndex];
    }
    handleMousemove(pos) {
        if (this.mousedownDialIndex === null
            || this.mousedownPos === null
            || this.mousedownDialInitialValue === null) {
            return;
        }
        const pixelDifference = pos.y - this.mousedownPos.y;
        const valueDifference = pixelDifference / 2 ** 6;
        this.levels[this.mousedownDialIndex] = this.mousedownDialInitialValue + valueDifference;
        this.sequencerProcessor.port.postMessage({ type: 'setLevels', payload: this.levels });
    }
    handleMouseup(pos) {
        this.mousedownDialIndex = null;
        this.mousedownDialInitialValue = null;
    }
    handleSequencerProcessorMessage(message) {
        switch (message.data.type) {
            case 'setActiveTick':
                this.handleSetActiveTick(message.data.payload);
                break;
            default:
                break;
        }
    }
    handleSetActiveTick(index) {
        this.currentIndex = index;
    }
    get buttonCount() {
        return this.levels.length;
    }
    getDialPositionByIndex(index) {
        const rowCount = Math.ceil(this.buttonCount / 8);
        const rowNumber = index % rowCount;
        const columnNumber = Math.floor(index / rowCount);
        const offsetFromCenter = (rowNumber - 0.5) * this.dialSpread;
        const xPosition = (this.width / 2) + offsetFromCenter;
        const yPosition = this.topOffset + (columnNumber * this.dialSpread);
        return {
            x: xPosition,
            y: yPosition,
        };
    }
    getCollidedDialIndex(pos) {
        return this.levels.findIndex((dialValue, index) => {
            const dialPos = this.getDialPositionByIndex(index);
            return distance(dialPos, pos) < this.dialSize;
        });
    }
    render(renderContext) {
        super.render(renderContext);
        this.levels.forEach((state, index) => {
            const pos = this.getDialPositionByIndex(index);
            this.renderDial(renderContext, pos, this.dialSize, this.levels[index], '');
            this.renderLed(renderContext, pos, 3, Number(this.currentIndex === index));
        });
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
