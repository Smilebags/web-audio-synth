import { modal } from "../util.js";
export default class SaveToClipboardButton {
    constructor(rack) {
        this.rack = rack;
        this.width = 32;
    }
    render(context) {
        context.drawImage(
        // @ts-ignore
        window.clipboardImage, 0, 0, this.width, this.width);
    }
    async handlePress() {
        try {
            const patchString = await this.rack.getPatchString();
            // @ts-ignore
            await navigator.clipboard.writeText(patchString);
            modal('Success', 'Saved patch to clipboard.');
        }
        catch (error) {
            modal('Error', 'Failed to save to clipboard.');
        }
    }
}
