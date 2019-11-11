export default class HeaderButtonFactory {
    static createButton(rack, moduleType, colour, label) {
        return {
            width: 32 * 3,
            render(context) {
                context.save();
                context.fillStyle = colour;
                context.fillRect(2, 2, this.width - 4, 28);
                context.fillStyle = '#ffffff';
                context.fillText(label || moduleType, 4, 28, this.width - 8);
                context.restore();
            },
            handlePress() {
                const newModule = rack.rackModuleFactory.createModule(moduleType, {});
                rack.addModule(newModule);
            },
        };
    }
}
