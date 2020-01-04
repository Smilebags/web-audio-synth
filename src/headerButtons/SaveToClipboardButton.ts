import HeaderButton from "../types/HeaderButton.js";
import Rack from "../Rack.js";
import { notify, modal } from "../util.js";

export default class SaveToClipboardButton implements HeaderButton {
  constructor(private rack: Rack) {}
  width: number = 32;
  render(context: CanvasRenderingContext2D): void {
    context.drawImage(
      // @ts-ignore
      window.clipboardImage,
      0,
      0,
      this.width,
      this.width,
    );
  }
  async handlePress() {
    try {
      const patchString = this.rack.getPatchString();
      // @ts-ignore
      await navigator.clipboard.writeText(patchString);
      modal('Success', 'Saved patch to clipboard.');
    } catch (error) {
      modal('Error', 'Failed to save to clipboard.');
    }
  }
}