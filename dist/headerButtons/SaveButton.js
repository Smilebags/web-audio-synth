import { chooseOption, modal } from "../util/Modal.js";
import stringLength from "../util/StringLength.js";
var SaveMethod;
(function (SaveMethod) {
    SaveMethod["Clipboard"] = "CLIPBOARD";
    SaveMethod["Browser"] = "BROWSER";
})(SaveMethod || (SaveMethod = {}));
export default class SaveButton {
    constructor(rack, storage, clipboard) {
        this.rack = rack;
        this.storage = storage;
        this.clipboard = clipboard;
        this.colour = '#008800';
        this.name = 'Save';
        this.width = (stringLength(this.name) * 10) + 8 + 8;
    }
    render(context) {
        context.save();
        context.fillStyle = this.colour;
        context.fillRect(2, 2, this.width - 4, 28);
        context.fillStyle = '#ffffff';
        context.font = '10px Arial';
        context.fillText(this.name, 4, 28, this.width - 6);
        context.restore();
    }
    async handlePress() {
        const patchString = await this.rack.getPatchString();
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
        }
        catch (error) {
            modal('Error', 'Failed to save');
        }
    }
    getSaveMethod() {
        return chooseOption('Save method', 'Where would you like to save?', [
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
        ]);
    }
}
