import stringLength from "../util/StringLength.js";
export default class HeaderButtonFactory {
    static createButton(rack, moduleType, colour, label) {
        const name = label || moduleType;
        return {
            width: (stringLength(name) * 10) + 8 + 8,
            render(context) {
                context.save();
                context.fillStyle = colour;
                context.fillRect(2, 2, this.width - 4, 28);
                context.fillStyle = '#ffffff';
                context.font = '10px Arial';
                context.fillText(name, 4, 28, this.width - 6);
                context.restore();
            },
            handlePress() {
                const newModule = rack.rackModuleFactory.createModule(moduleType, {});
                rack.addModule(newModule);
            },
        };
    }
}
