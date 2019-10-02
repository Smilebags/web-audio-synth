import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class MidiInputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = "MidiInput";
  name = "Midi In";

  private gate: ConstantSourceNode;
  private vo: ConstantSourceNode;
  private gateHighVoltage: number;
  private currentNotes: Set<number>;
  private midiInputs: any = null;
  private midiInput: any = null;
  private midiInputIndex = 0;

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

    this.gate = this.context.createConstantSource();
    this.gate.offset.value = 0;
    this.gate.start();

    this.vo = this.context.createConstantSource();
    this.vo.offset.value = 0;
    this.vo.start();

    this.setupMidiAccess();

    this.addPlug(this.gate, "Gate", "out");
    this.addPlug(this.vo, "V/O", "out");
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
    this.midiInput.onmidimessage = (e: any) => this.handleMidiMessage(e);
  }

  handleMidiMessage(e:any ): void {
    switch (e.data[0]) {
      case 144:
        this.handleNoteOn(e.data);
        break;
      case 128:
        this.handleNoteOff(e.data);
        break;
      default:
        break;
    }
  }

  handleNoteOn(data: [144, number, number]) {
    this.currentNotes.add(data[1]);
    const keyVoltage = this.voltageFromKeyNumber(data[1]);
    this.setVOVoltage(keyVoltage);
    this.setGate(true);
  }
  handleNoteOff(data: [128, number, number]) {
    if (!this.currentNotes.has(data[1])) {
      return;
    }
    this.currentNotes.delete(data[1]);
    this.setGate(this.currentNotes.size !== 0)
  }

  voltageFromKeyNumber(keyNumber: number): number {
    return (keyNumber - 69) / 12;
  }

  setVOVoltage(voltage: number) {
    this.vo.offset.value = voltage;
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
