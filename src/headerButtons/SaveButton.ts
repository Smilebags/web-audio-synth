import HeaderButton from "../types/HeaderButton.js";
import Rack from "../Rack.js";
import { chooseOption, modal } from "../util.js";
import stringLength from "../StringLength.js";

enum SaveMethod {
  Clipboard = 'CLIPBOARD',
  Browser = 'BROWSER',
}

export default class SaveButton implements HeaderButton {
  constructor(
    private rack: Rack,
    private storage: Storage,
    private clipboard: Clipboard,
  ) {}
  private colour = '#008800';
  private name = 'Save';
  width = (stringLength(this.name) * 10) + 8 + 8;

  render(
    context: CanvasRenderingContext2D
  ): void {
    context.save();
      context.fillStyle = this.colour;
      context.fillRect(2, 2, this.width - 4, 28);
      context.fillStyle = '#ffffff';
      context.font = '10px Arial';
      context.fillText(this.name, 4, 28, this.width - 6);
    context.restore();
  }

  async handlePress() {
    const patchString: string = await this.rack.getPatchString();
    const method = await this.getSaveMethod();
    if (method === null) {
      return;
    }
    try {
      switch (method) {
        case SaveMethod.Browser:
          await this.storage.setItem('saved-rack', patchString);
          break;
        case SaveMethod.Clipboard:
          await this.clipboard.writeText(patchString);
          break;
        default:
          break;
      }
      modal('Success', 'Saved');
    } catch (error) {
      modal('Error', 'Failed to save');
    }
  }

  getSaveMethod() {
    return chooseOption<SaveMethod | null, {text: string, value: SaveMethod | null}>(
      'Save method',
      'Where would you like to save?',
      [
        {
          text: 'Browser',
          value: SaveMethod.Browser,
        },
        {
          text: 'Clipboard',
          value: SaveMethod.Clipboard,
        },
        {
          text: 'Cancel',
          value: null,
        },
      ],
    );
  }
}
