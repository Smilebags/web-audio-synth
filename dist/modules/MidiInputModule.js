import AbstractRackModule from "./AbstractRackModule.js";
import { chooseOption } from "../util/Modal.js";
export default class MidiInputModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = "MidiInput";
        this.name = "Midi In";
        this.midiInputs = null;
        this.midiInput = null;
        this.isInLearnMode = false;
        this.noteOnOffset = 16;
        this.pitchbendOffset = 96;
        this.modwheelOffset = 48;
        const { gateHighVoltage = 1 } = params;
        const { channel = 1 } = params;
        this.context = context;
        this.gateHighVoltage = gateHighVoltage;
        this.channel = channel;
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
        this.addPlug({ param: this.vo, name: "V/O", type: "out" });
        this.addPlug({ param: this.velocity, name: "Velocity", type: "out" });
        this.addPlug({ param: this.gate, name: "Gate", type: "out" });
        this.addPlug({ param: this.trigger, name: "Trigger", type: "out" });
        this.addPlug({ param: this.pitchBend, name: "Pitchbend", type: "out" });
        this.addPlug({ param: this.modWheel, name: "Modwheel", type: "out" });
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
            const eventStatus = midiInputEvent.data[0];
            if (eventStatus < 144 || eventStatus > 159) {
                return;
            }
            this.channel = eventStatus - 143;
            this.isInLearnMode = false;
        }, { once: true });
    }
    get noteOnStatus() {
        return 127 + this.channel + this.noteOnOffset;
    }
    get noteOffStatus() {
        return 127 + this.channel;
    }
    get pitchbendStatus() {
        return 127 + this.channel + this.pitchbendOffset;
    }
    get modwheelStatus() {
        return 127 + this.channel + this.modwheelOffset;
    }
    async setupMidiAccess() {
        // @ts-ignore
        const access = await navigator.requestMIDIAccess({ sysex: false });
        this.midiInputs = [];
        for (const input of access.inputs.values()) {
            this.midiInputs.push(input);
        }
        if (!this.midiInputs.length) {
            return;
        }
        if (this.midiInputs.length === 1) {
            this.midiInput = this.midiInputs[0];
        }
        else {
            const choice = await chooseOption('MIDI Note Input device', 'Choose which MIDI device to use for the MIDI Keyboard module', this.midiInputs.map((input) => input.name));
            const index = this.midiInputs.findIndex((input) => input.name === choice);
            this.midiInput = this.midiInputs[index];
        }
        this.midiInput.onmidimessage = (e) => this.handleMidiMessage(e);
    }
    handleMidiMessage(e) {
        switch (e.data[0]) {
            case this.noteOnStatus:
                this.handleNoteOn(e.data);
                break;
            case this.noteOffStatus:
                this.handleNoteOff(e.data);
                break;
            case this.pitchbendStatus:
                this.handlePitchBend(e.data);
                break;
            case this.modwheelStatus:
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
            ...super.toParams(),
            channel: this.channel,
            gateHighVoltage: this.gateHighVoltage
        };
    }
}
