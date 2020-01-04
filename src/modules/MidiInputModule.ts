import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { chooseOption } from "../util.js";

export default class MidiInputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = "MidiInput";
  name = "Midi In";

  private gate: ConstantSourceNode;
  private velocity: ConstantSourceNode;
  private trigger: ConstantSourceNode;
  private pitchBend: ConstantSourceNode;
  private modWheel: ConstantSourceNode;
  private vo: ConstantSourceNode;
  private gateHighVoltage: number;
  private currentNotes: Set<number>;
  private midiInputs: any = null;
  private midiInput: any = null;
  private isInLearnMode = false;
  
  private channel = 1;
  private readonly noteOnOffset = 16;
  private readonly pitchbendOffset = 96;
  private readonly modwheelOffset = 48;

  constructor(
    context: AudioContext,
    {
      gateHighVoltage = 1
    }: {
      gateHighVoltage?: number;
    }
  ) {
    super();

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

    this.addButton({
      enabled: () => this.isInLearnMode,
      callback: () => this.triggerLearnMode(),
      position: {x: 5, y: 305},
      size: {x: 90, y: 90},
      text: () => this.isInLearnMode ? 'Learning' : 'Learn',
    });
    this.addDefaultEventListeners();
  }

  triggerLearnMode() {
    this.isInLearnMode = true;
    this.midiInput.addEventListener(
      'midimessage',
      (midiInputEvent: any) => {
        const eventStatus = midiInputEvent.data[0];
        if (eventStatus < 144 || eventStatus > 159) {
          return;
        }
        this.channel = eventStatus - 143;
        this.isInLearnMode = false;
      },
      {once: true},
    );
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
    } else {
        const choice = await chooseOption(
          'MIDI Note Input device',
          'Choose which MIDI device to use for the MIDI Keyboard module',
          this.midiInputs.map((input: any) => input.name),
        );
        const index = this.midiInputs.findIndex((input: any) => input.name === choice);
        this.midiInput = this.midiInputs[index];
    }
    
    this.midiInput.onmidimessage = (e: any) => this.handleMidiMessage(e);
  }

  handleMidiMessage(e:any ): void {
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

  handleNoteOn(data: [144, number, number]) {
    this.currentNotes.add(data[1]);
    const keyVoltage = this.voltageFromKeyNumber(data[1]);
    this.setVOVoltage(keyVoltage);
    const keyVelocity = data[2] / 127;
    this.setVelocity(keyVelocity);
    this.setGate(true);
    this.handleTrigger();
  }

  handleNoteOff(data: [128, number, number]) {
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

  handlePitchBend(data: [224, number, number]) {
    const pitchbendValue = data[2] > 0
      ? (data[2] - 64) / 63
      : (data[2] - 64) / 64;
    this.pitchBend.offset.value = pitchbendValue;
  }
  handleModWheel(data: [224, number, number]) {
    if (data[1] !== 1) {
      return;
    }
    this.modWheel.offset.value = data[2] / 127;
  }

  voltageFromKeyNumber(keyNumber: number): number {
    return (keyNumber - 69) / 12;
  }

  handleTrigger() {
    this.trigger.offset.value = this.gateHighVoltage;
    setTimeout(() => {
      this.trigger.offset.value = 0;
    }, 5);
  }

  setVOVoltage(voltage: number) {
    this.vo.offset.value = voltage;
  }

  setVelocity(voltage: number) {
    this.velocity.offset.value = voltage;
  }

  setGate(onOff: boolean): void {
    this.gate.offset.value = onOff ? this.gateHighVoltage : 0;
  }

  toParams(): any {
    return {
      type: this.type,
      gateHighVoltage: this.gateHighVoltage
    };
  }
}
