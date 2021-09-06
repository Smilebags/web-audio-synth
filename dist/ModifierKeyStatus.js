export default class ModifierKeyStatus {
    constructor() {
        this.altIsPressed = false;
        this.shiftIsPressed = false;
        this.ctrlIsPressed = false;
        this.metaIsPressed = false;
        document.addEventListener('keydown', e => this.handleKeychange(e));
        document.addEventListener('keyup', e => this.handleKeychange(e));
        window.addEventListener('blur', () => this.handleFocusEvent());
        window.addEventListener('focus', () => this.handleFocusEvent());
    }
    logActiveModifiers() {
        console.log({
            alt: this.altIsPressed,
            shift: this.shiftIsPressed,
            ctrl: this.ctrlIsPressed,
            meta: this.metaIsPressed,
        });
    }
    handleFocusEvent() {
        this.altIsPressed = false;
        this.ctrlIsPressed = false;
        this.shiftIsPressed = false;
        this.metaIsPressed = false;
    }
    handleKeychange(keychangeEvent) {
        this.altIsPressed = keychangeEvent.getModifierState('Alt');
        this.ctrlIsPressed = keychangeEvent.getModifierState('Control');
        this.shiftIsPressed = keychangeEvent.getModifierState('Shift');
        this.metaIsPressed = !!keychangeEvent.metaKey;
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
    get meta() {
        return this.metaIsPressed;
    }
}
