import { RackModuleType } from "../types/RackModuleType";
import Rack from "../Rack";
import HeaderButton from "../types/HeaderButton";

export default class HeaderButtonFactory {
  static createButton(rack: Rack, moduleType: RackModuleType, colour: string, label?: string): HeaderButton {
    return {
      width: 32 * 3,
      render(context: CanvasRenderingContext2D): void {
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