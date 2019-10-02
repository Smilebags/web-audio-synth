import AbstractRackModule from "./AbstractRackModule.js";
export default class MidiCCInputModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.type = "MidiCCInput";
        this.name = "CC In";
        this.midiInput = null;
        this.ccRangeOffset = 21;
        this.context = context;
        this.outputs = [];
        for (let i = 0; i < 8; i++) {
            const output = this.context.createConstantSource();
            output.offset.value = 0;
            output.start();
            this.outputs.push(output);
        }
        this.setupMidiAccess();
        this.addPlug(this.outputs[0], "1", "out");
        this.addPlug(this.outputs[1], "2", "out");
        this.addPlug(this.outputs[2], "3", "out");
        this.addPlug(this.outputs[3], "4", "out");
        this.addPlug(this.outputs[4], "5", "out");
        this.addPlug(this.outputs[5], "6", "out");
        this.addPlug(this.outputs[6], "7", "out");
        this.addPlug(this.outputs[7], "8", "out");
    }
    async setupMidiAccess() {
        // @ts-ignore
        const access = await navigator.requestMIDIAccess({ sysex: false });
        const midiInputs = [];
        for (const input of access.inputs.values()) {
            midiInputs.push(input);
        }
        if (midiInputs.length) {
            this.midiInput = midiInputs[0];
        }
        this.midiInput.onmidimessage = (e) => this.handleMidiMessage(e);
    }
    handleMidiMessage(e) {
        console.log(e.data);
        switch (e.data[0]) {
            case 176:
                this.handleCCMessage(e.data);
            default:
                break;
        }
    }
    handleCCMessage(data) {
        const outputIndex = data[1] - this.ccRangeOffset;
        const value = data[2] / 127;
        this.outputs[outputIndex].offset.value = value;
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
