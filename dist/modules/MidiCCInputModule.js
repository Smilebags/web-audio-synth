import AbstractRackModule from "./AbstractRackModule.js";
import { chooseOption } from "../util/Modal.js";
export default class MidiCCInputModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = "MidiCCInput";
        this.name = this.name || "CC In";
        this.midiInput = null;
        this.isInLearnMode = false;
        const { ccRangeOffset = 21 } = params;
        this.context = context;
        this.ccRangeOffset = ccRangeOffset;
        this.outputs = [];
        for (let i = 0; i < 8; i++) {
            const output = this.context.createConstantSource();
            output.offset.value = 0;
            output.start();
            this.outputs.push(output);
        }
        this.setupMidiAccess();
        this.addPlug({ param: this.outputs[0], name: "1", type: "out", order: 0, position: 'left' });
        this.addPlug({ param: this.outputs[1], name: "2", type: "out", order: 1, position: 'left' });
        this.addPlug({ param: this.outputs[2], name: "3", type: "out", order: 2, position: 'left' });
        this.addPlug({ param: this.outputs[3], name: "4", type: "out", order: 3, position: 'left' });
        this.addPlug({ param: this.outputs[4], name: "5", type: "out", order: 0, position: 'right' });
        this.addPlug({ param: this.outputs[5], name: "6", type: "out", order: 1, position: 'right' });
        this.addPlug({ param: this.outputs[6], name: "7", type: "out", order: 2, position: 'right' });
        this.addPlug({ param: this.outputs[7], name: "8", type: "out", order: 3, position: 'right' });
        this.addButton({
            enabled: () => this.isInLearnMode,
            callback: () => this.triggerLearnMode(),
            position: { x: 5, y: 305 },
            size: { x: 90, y: 90 },
            text: () => this.isInLearnMode ? 'Learning' : 'Learn',
        });
        this.addDefaultEventListeners();
    }
    triggerLearnMode() {
        this.isInLearnMode = true;
        this.midiInput.addEventListener('midimessage', (midiInputEvent) => {
            this.ccRangeOffset = midiInputEvent.data[1];
            this.isInLearnMode = false;
        }, { once: true });
    }
    async setupMidiAccess() {
        // @ts-ignore
        const access = await navigator.requestMIDIAccess({ sysex: false });
        const midiInputs = [];
        for (const input of access.inputs.values()) {
            midiInputs.push(input);
        }
        if (!midiInputs.length) {
            return;
        }
        if (midiInputs.length === 1) {
            this.midiInput = midiInputs[0];
        }
        else {
            const choice = await chooseOption('MIDI CC Input device', 'Choose which MIDI device to use for the MIDI CC Module', midiInputs.map(input => input.name));
            const index = midiInputs.findIndex(input => input.name === choice);
            this.midiInput = midiInputs[index];
        }
        this.midiInput.addEventListener('midimessage', (e) => this.handleMidiMessage(e));
    }
    handleMidiMessage(e) {
        switch (e.data[0]) {
            case 176:
                this.handleCCMessage(e.data);
            default:
                break;
        }
    }
    handleCCMessage(data) {
        const outputIndex = data[1] - this.ccRangeOffset;
        if (!this.outputs[outputIndex]) {
            return;
        }
        const value = data[2] / 127;
        this.outputs[outputIndex].offset.value = value;
    }
    toParams() {
        return {
            ...super.toParams(),
            ccRangeOffset: this.ccRangeOffset,
        };
    }
}
