import AbstractRackModule from "./AbstractRackModule.js";
import { distance } from "../util/Vec2Math.js";
export default class ChordsModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.width = 200;
        this.type = 'Chords';
        this.channelOutputs = [];
        this.activeStep = 0;
        this.callbackDials = [];
        this.mousedownDialIndex = null;
        this.mousedownDialInitialValue = null;
        this.gridXOffset = 30;
        this.gridXSpan = 30;
        this.gridYOffset = 70;
        this.gridYSpan = 30;
        this.dialRadius = 13;
        this.context = context;
        this.channelLevels = params.channelLevels || [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        this.processor = new AudioWorkletNode(this.context, 'chords-processor', { numberOfOutputs: 4 });
        this.noopGain = this.context.createGain();
        this.noopGain.gain.value = 0;
        this.noopGain.connect(this.context.destination);
        this.processor.port.onmessage = (message) => this.handleProcessorMessage(message);
        this.processor.connect(this.noopGain);
        this.channelOutputs[0] = this.context.createGain();
        this.channelOutputs[1] = this.context.createGain();
        this.channelOutputs[2] = this.context.createGain();
        this.channelOutputs[3] = this.context.createGain();
        this.processor.connect(this.channelOutputs[0], 0);
        this.processor.connect(this.channelOutputs[1], 1);
        this.processor.connect(this.channelOutputs[2], 2);
        this.processor.connect(this.channelOutputs[3], 3);
        const resetTriggerParam = this.processor.parameters.get('resetTrigger');
        const stepTriggerParam = this.processor.parameters.get('stepTrigger');
        this.addPlug({ param: stepTriggerParam, name: '', type: 'in', order: null, position: { x: 30, y: 40 } });
        const stepLabel = {
            getText: () => 'Step',
            position: { x: 50, y: 43 },
            align: 'left',
        };
        this.addLabel(stepLabel);
        this.addPlug({ param: resetTriggerParam, name: '', type: 'in', order: null, position: { x: 120, y: 40 } });
        const resetLabel = {
            getText: () => 'Reset',
            position: { x: 140, y: 43 },
            align: 'left',
        };
        this.addLabel(resetLabel);
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 4; x++) {
                this.addCallbackDial({
                    x: this.gridXOffset + (this.gridXSpan * x),
                    y: this.gridYOffset + (this.gridYSpan * y),
                }, this.dialRadius, () => this.channelLevels[x][y], (value) => this.setValue(x, y, value));
            }
            this.addPlug({ param: this.noopGain, name: '', type: 'in', order: null, position: { x: 150, y: this.gridYOffset + (this.gridYSpan * y) } });
        }
        for (let x = 0; x < 4; x++) {
            this.addPlug({ param: this.channelOutputs[x], name: '', type: 'out', order: null, position: { x: this.gridXOffset + (this.gridXSpan * x), y: 380 } });
        }
        this.addDefaultEventListeners();
    }
    handleMousedown(mousedownPosition) {
        const selectedDialIndex = this.getCollidedDialIndex(mousedownPosition);
        if (selectedDialIndex === null) {
            return;
        }
        this.mousedownPos = mousedownPosition;
        this.mousedownDialIndex = selectedDialIndex;
        this.mousedownDialInitialValue = this.channelLevels[selectedDialIndex[0]][selectedDialIndex[1]];
    }
    handleMousemove(pos) {
        if (this.mousedownDialIndex === null
            || this.mousedownPos === null
            || this.mousedownDialInitialValue === null) {
            return;
        }
        const pixelDifference = pos.y - this.mousedownPos.y;
        const valueDifference = pixelDifference / 2 ** 8;
        const newValue = this.mousedownDialInitialValue + valueDifference;
        this.setValue(this.mousedownDialIndex[0], this.mousedownDialIndex[1], newValue);
    }
    handleMouseup() {
        this.mousedownDialIndex = null;
        this.mousedownDialInitialValue = null;
    }
    getCollidedDialIndex(pos) {
        for (let x = 0; x < this.channelLevels.length; x++) {
            for (let y = 0; y < this.channelLevels[x].length; y++) {
                const dialPosition = {
                    x: this.gridXOffset + (this.gridXSpan * x),
                    y: this.gridYOffset + (this.gridYSpan * y),
                };
                if (distance(pos, dialPosition) < this.dialRadius) {
                    return [x, y];
                }
            }
        }
        return null;
    }
    setValue(channel, index, value) {
        this.channelLevels[channel][index] = value;
        const payload = {
            channel,
            index,
            value,
        };
        this.processor.port.postMessage({ type: 'setLevel', payload });
    }
    handleProcessorMessage(message) {
        switch (message.data.type) {
            case 'setActiveStep':
                this.handleSetActiveStep(message.data.payload);
                break;
            default:
                break;
        }
    }
    handleSetActiveStep(index) {
        this.activeStep = index;
    }
    addCallbackDial(position, radius = 10, value, changeCallback) {
        this.callbackDials.push({
            position,
            radius,
            value,
            changeCallback,
        });
    }
    render(renderContext) {
        super.render(renderContext);
        for (let i = 0; i < 8; i++) {
            const pos = { x: 175, y: this.gridYOffset + (this.gridYSpan * i) };
            this.renderLed(renderContext, pos, 5, Number(this.activeStep === i));
        }
        this.callbackDials.forEach((callbackDial) => {
            this.renderDial(renderContext, callbackDial.position, callbackDial.radius, callbackDial.value() * 2 * Math.PI, '');
        });
    }
    toParams() {
        return {
            ...super.toParams(),
            channelLevels: this.channelLevels,
        };
    }
}
