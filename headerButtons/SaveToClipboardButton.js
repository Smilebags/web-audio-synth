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
    handlePress() {
        const patchString = this.rack.getPatchString();
        // @ts-ignore
        navigator.clipboard.writeText(patchString);
        console.log('Saved to clipboard');
        alert('Saved to clipboard');
    }
}
