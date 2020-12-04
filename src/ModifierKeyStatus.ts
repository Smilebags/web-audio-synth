export default class ModifierKeyStatus {
  private altIsPressed = false;
  private shiftIsPressed = false;
  private ctrlIsPressed = false;
  private metaIsPressed = false;
  constructor() {
    document.addEventListener('keydown', e => this.handleKeychange(e));
    document.addEventListener('keyup', e => this.handleKeychange(e));
  }

  handleKeychange(keychangeEvent: KeyboardEvent): void {
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