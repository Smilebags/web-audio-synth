import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { chooseOption } from "../util.js";

export default class MidiCCInputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = "MidiCCInput";
  name = "CC In";
  
  
  private outputs: ConstantSourceNode[];
  private midiInput: any = null;
  private ccOffset: number | null = null;

  private ccRangeOffset = 21;

  constructor(context: AudioContext) {
    super();

    this.context = context;

    this.outputs = [];
    for (let i = 0; i < 8; i++) {
      const output = this.context.createConstantSource();
      output.offset.value = 0;
      output.start();
      this.outputs.push(output);
    }

    this.setupMidiAccess();

    this.addPlug(this.outputs[0], "1", "out", 0, 'left');
    this.addPlug(this.outputs[1], "2", "out", 1, 'left');
    this.addPlug(this.outputs[2], "3", "out", 2, 'left');
    this.addPlug(this.outputs[3], "4", "out", 3, 'left');
    this.addPlug(this.outputs[4], "5", "out", 0, 'right');
    this.addPlug(this.outputs[5], "6", "out", 1, 'right');
    this.addPlug(this.outputs[6], "7", "out", 2, 'right');
    this.addPlug(this.outputs[7], "8", "out", 3, 'right');
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
    } else {
      const choice = await chooseOption(
        'MIDI CC Input device',
        'Choose which MIDI device to use for the MIDI CC Module',
        midiInputs.map(input => input.name),
      );
      const index = midiInputs.findIndex(input => input.name === choice);
      this.midiInput = midiInputs[index];
    }
    
    this.midiInput.onmidimessage = (e: any) => this.handleMidiMessage(e);
  }

  handleMidiMessage(e:any ): void {
    switch (e.data[0]) {
      case 176:
        this.handleCCMessage(e.data);
      default:
        break;
    }
  }

  handleCCMessage(data: [176, number, number]) {
    const outputIndex = data[1] - this.ccRangeOffset;
    if (!this.outputs[outputIndex]) {
      return;
    }
    const value = data[2] / 127;
    this.outputs[outputIndex].offset.value = value;
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}
