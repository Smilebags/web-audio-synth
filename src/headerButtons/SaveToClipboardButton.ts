import HeaderButton from "../types/HeaderButton";
import Rack from "../Rack";

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
    const patchString = this.rack.getPatchString();
    navigator.clipboard.writeText(patchString);
    console.log('Saved to clipboard');
    alert('Saved to clipboard');
  }
}