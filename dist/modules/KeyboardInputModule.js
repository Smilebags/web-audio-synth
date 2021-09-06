import AbstractRackModule from "./AbstractRackModule.js";
const KEYMAP = {
    a: 'c-1',
    w: 'db-1',
    s: 'd-1',
    e: 'eb-1',
    d: 'e-1',
    f: 'f-1',
    t: 'gb-1',
    g: 'g-1',
    y: 'ab-1',
    h: 'a',
    u: 'bb',
    j: 'b',
    k: 'c',
    o: 'db',
    l: 'd',
    p: 'eb',
    ';': 'e',
    '\'': 'f',
};
const VOLTMAP = {
    'c-1': -9 / 12,
    'db-1': -8 / 12,
    'd-1': -7 / 12,
    'eb-1': -6 / 12,
    'e-1': -5 / 12,
    'f-1': -4 / 12,
    'gb-1': -3 / 12,
    'g-1': -2 / 12,
    'ab-1': -1 / 12,
    a: 0 / 12,
    bb: 1 / 12,
    b: 2 / 12,
    c: 3 / 12,
    db: 4 / 12,
    d: 5 / 12,
    eb: 6 / 12,
    e: 7 / 12,
    f: 8 / 12,
};
export default class KeyboardInputModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'KeyboardInput';
        this.name = 'Keyboard In';
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
            ...super.toParams(),
            isOn: this.isOn,
            octave: this.octave,
            gateHighVoltage: this.gateHighVoltage,
        };
    }
}
