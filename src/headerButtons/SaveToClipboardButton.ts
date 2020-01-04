import HeaderButton from "../types/HeaderButton.js";
import Rack from "../Rack.js";
import { notify } from "../util.js";

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
      notify('Saved to clipboard');
    } catch (error) {
      notify('Failed to save to clipboard');
      
    }
  }
}