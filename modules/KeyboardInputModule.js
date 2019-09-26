import AbstractRackModule from "./AbstractRackModule.js";
const KEYMAP = {
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
const VOLTMAP = {
    a: 0 / 12,
    bb: 1 / 12,
    b: 2 / 12,
    c: 3 / 12,
    db: 4 / 12,
    d: 5 / 12,
    eb: 6 / 12,
    e: 7 / 12,
    f: 8 / 12,
    gb: 9 / 12,
    g: 10 / 12,
    ab: 11 / 12,
    a1: 12 / 12,
    bb1: 13 / 12,
    b1: 14 / 12,
    c1: 15 / 12,
    db1: 16 / 12,
    d1: 17 / 12,
};
export default class KeyboardInputModule extends AbstractRackModule {
    constructor(context, { isOn = true, octave = 0, gateHighVoltage = 1, }) {
        super();
        this.type = 'KeyboardInput';
        this.name = 'Keyboard In';
        this.mousedownPos = null;
        this.mousemovePos = null;
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
        this.addPlug(this.gate, 'Gate', 'out');
        this.addPlug(this.vo, 'V/O', 'out');
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        window.addEventListener('keydown', (e) => { this.handleKeydown(e); });
        window.addEventListener('keyup', (e) => { this.handleKeyup(e); });
    }
    handleMousedown(mousedownEvent) {
        if (!this.isOverPowerButton(mousedownEvent)) {
            this.isOn = !this.isOn;
        }
    }
    handleKeydown(e) {
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
    handleKeyup(e) {
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
    isOverPowerButton(pos) {
        return pos.y >= 200;
    }
    toParams() {
        return {
            type: this.type,
            isOn: this.isOn,
            octave: this.octave,
            gateHighVoltage: this.gateHighVoltage,
        };
    }
}
