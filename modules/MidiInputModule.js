import AbstractRackModule from "./AbstractRackModule.js";
export default class MidiInputModule extends AbstractRackModule {
    constructor(context, { gateHighVoltage = 1 }) {
        super();
        this.type = "MidiInput";
        this.name = "Midi In";
        this.midiInputs = null;
        this.midiInput = null;
        this.midiInputIndex = 0;
        this.context = context;
        this.gateHighVoltage = gateHighVoltage;
        this.currentNotes = new Set();
        this.velocity = this.context.createConstantSource();
        this.velocity.offset.value = 0;
        this.velocity.start();
        this.gate = this.context.createConstantSource();
        this.gate.offset.value = 0;
        this.gate.start();
        this.trigger = this.context.createConstantSource();
        this.trigger.offset.value = 0;
        this.trigger.start();
        this.pitchBend = this.context.createConstantSource();
        this.pitchBend.offset.value = 0;
        this.pitchBend.start();
        this.modWheel = this.context.createConstantSource();
        this.modWheel.offset.value = 0;
        this.modWheel.start();
        this.vo = this.context.createConstantSource();
        this.vo.offset.value = 0;
        this.vo.start();
        this.setupMidiAccess();
        this.addPlug(this.vo, "V/O", "out");
        this.addPlug(this.velocity, "Velocity", "out");
        this.addPlug(this.gate, "Gate", "out");
        this.addPlug(this.trigger, "Trigger", "out");
        this.addPlug(this.pitchBend, "Pitchbend", "out");
        this.addPlug(this.modWheel, "Modwheel", "out");
    }
    async setupMidiAccess() {
        // @ts-ignore
        const access = await navigator.requestMIDIAccess({ sysex: false });
        this.midiInputs = [];
        for (const input of access.inputs.values()) {
            this.midiInputs.push(input);
        }
        if (this.midiInputs.length) {
            this.midiInput = this.midiInputs[0];
        }
        if (!this.midiInput) {
            return;
        }
        this.midiInput.onmidimessage = (e) => this.handleMidiMessage(e);
    }
    handleMidiMessage(e) {
        console.log(e.data);
        switch (e.data[0]) {
            case 144:
                this.handleNoteOn(e.data);
                break;
            case 128:
                this.handleNoteOff(e.data);
                break;
            case 224:
                this.handlePitchBend(e.data);
                break;
            case 176:
                this.handleModWheel(e.data);
                break;
            default:
                break;
        }
    }
    handleNoteOn(data) {
        this.currentNotes.add(data[1]);
        const keyVoltage = this.voltageFromKeyNumber(data[1]);
        this.setVOVoltage(keyVoltage);
        const keyVelocity = data[2] / 127;
        this.setVelocity(keyVelocity);
        this.setGate(true);
        this.handleTrigger();
    }
    handleNoteOff(data) {
        if (!this.currentNotes.has(data[1])) {
            return;
        }
        this.currentNotes.delete(data[1]);
        this.setGate(this.currentNotes.size !== 0);
        const previousNote = Array.from(this.currentNotes).pop();
        if (!previousNote) {
            return;
        }
        const keyVoltage = this.voltageFromKeyNumber(previousNote);
        this.setVOVoltage(keyVoltage);
    }
    handlePitchBend(data) {
        const pitchbendValue = data[2] > 0
            ? (data[2] - 64) / 63
            : (data[2] - 64) / 64;
        this.pitchBend.offset.value = pitchbendValue;
    }
    handleModWheel(data) {
        if (data[1] !== 1) {
            return;
        }
        this.modWheel.offset.value = data[2] / 127;
    }
    voltageFromKeyNumber(keyNumber) {
        return (keyNumber - 69) / 12;
    }
    handleTrigger() {
        this.trigger.offset.value = this.gateHighVoltage;
        setTimeout(() => {
            this.trigger.offset.value = 0;
        }, 5);
    }
    setVOVoltage(voltage) {
        this.vo.offset.value = voltage;
    }
    setVelocity(voltage) {
        this.velocity.offset.value = voltage;
    }
    setGate(onOff) {
        this.gate.offset.value = onOff ? this.gateHighVoltage : 0;
    }
    toParams() {
        return {
            type: this.type,
            gateHighVoltage: this.gateHighVoltage
        };
    }
}
