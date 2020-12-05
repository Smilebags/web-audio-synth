import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

const KEYMAP: {[key: string]: string} = {
  a: 'a',
  w: 'bb',
  s: 'b',
  e: 'c',
  d: 'db',
  f: 'd',
  t: 'eb',
  g: 'e',
  y: 'f',
  h: 'gb',
  u: 'g',
  j: 'ab',
  k: 'a1',
  o: 'bb1',
  l: 'b1',
  p: 'c1',
  ';': 'db1',
  '\'': 'd1',
};

const VOLTMAP: {[key: string]: number} = {
  a: 0/12,
  bb: 1/12,
  b: 2/12,
  c: 3/12,
  db: 4/12,
  d: 5/12,
  eb: 6/12,
  e: 7/12,
  f: 8/12,
  gb: 9/12,
  g: 10/12,
  ab: 11/12,
  a1: 12/12,
  bb1: 13/12,
  b1: 14/12,
  c1: 15/12,
  db1: 16/12,
  d1: 17/12,
};

export default class KeyboardInputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'KeyboardInput';
  name = 'Keyboard In';

  gate: ConstantSourceNode;
  vo: ConstantSourceNode;
  isOn: boolean;
  octave: number;
  gateHighVoltage: number;
  currentKeys: Set<string>;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    const { isOn = true } = params;
    const { octave = 0 } = params;
    const { gateHighVoltage = 1 } = params;

    this.context = context;

    this.isOn = isOn;
    this.octave = octave;
    this.gateHighVoltage = gateHighVoltage;
    this.currentKeys = new Set();

    this.gate = this.context.createConstantSource();
    this.gate.offset.value = 0;
    this.gate.start();

    this.vo = this.context.createConstantSource();
    this.vo.offset.value = 0;
    this.vo.start();

    this.addPlug({ param: this.gate, name: 'Gate', type: 'out' });
    this.addPlug({ param: this.vo, name: 'V/O', type: 'out' });

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    window.addEventListener('keydown', (e: KeyboardEvent) => {this.handleKeydown(e)})
    window.addEventListener('keyup', (e: KeyboardEvent) => {this.handleKeyup(e)})
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (!this.isOverPowerButton(mousedownEvent)) {
      this.isOn = !this.isOn;
    }
  }

  handleKeydown(e:KeyboardEvent): void {
    // handle octave buttons
    if (e.key === 'z') {
      this.octave -= 1;
    }

    if (e.key === 'x') {
      this.octave += 1;
    }

    if (!Object.keys(KEYMAP).includes(e.key)) {
      return;
    }
    const key = KEYMAP[e.key];
    this.currentKeys.add(key);
    this.vo.offset.value = VOLTMAP[key] + this.octave;
    this.gate.offset.value = this.gateHighVoltage;
  }

  handleKeyup(e:KeyboardEvent): void {
    if (!Object.keys(KEYMAP).includes(e.key)) {
      return;
    }
    const key = KEYMAP[e.key];
    this.currentKeys.delete(key);
    if (this.currentKeys.size === 0) {
      this.gate.offset.value = 0;
    }
    const previousKey = Array.from(this.currentKeys).pop();
    if (!previousKey) {
      return;
    }
    this.vo.offset.value = VOLTMAP[previousKey] + this.octave;
  }

  isOverPowerButton(pos: Vec2): boolean {
    return pos.y >= 200;
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      isOn: this.isOn,
      octave: this.octave,
      gateHighVoltage: this.gateHighVoltage,
    };
  }
}