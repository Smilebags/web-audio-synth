export default class HeaderButtonFactory {
    static createButton(rack, moduleType, colour) {
        return {
            width: 32,
            render(context) {
                context.save();
                context.fillStyle = colour;
                context.fillRect(8, 8, 16, 16);
                context.restore();
            },
            handlePress() {
                const newGain = rack.rackModuleFactory.createModule(moduleType, {});
                rack.addModule(newGain);
            },
        };
    }
}
