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
        const patchString = this.rack.getPatchString();
        navigator.clipboard.writeText(patchString);
        console.log('Saved to clipboard');
        alert('Saved to clipboard');
    }
}
