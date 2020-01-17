export default class ModifierKeyStatus {
    constructor() {
        this.altIsPressed = false;
        this.shiftIsPressed = false;
        this.ctrlIsPressed = false;
        document.addEventListener('keydown', e => this.handleKeychange(e));
        document.addEventListener('keyup', e => this.handleKeychange(e));
    }
    handleKeychange(keychangeEvent) {
        this.altIsPressed = keychangeEvent.getModifierState('Alt');
        this.ctrlIsPressed = keychangeEvent.getModifierState('Control');
        this.shiftIsPressed = keychangeEvent.getModifierState('Shift');
    }
    get alt() {
        return this.altIsPressed;
    }
    get ctrl() {
        return this.ctrlIsPressed;
    }
    get shift() {
        return this.shiftIsPressed;
    }
}
