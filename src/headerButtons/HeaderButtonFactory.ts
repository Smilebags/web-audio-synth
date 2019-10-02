import { RackModuleType } from "../types/RackModuleType";
import Rack from "../Rack";
import HeaderButton from "../types/HeaderButton";

export default class HeaderButtonFactory {
  static createButton(rack: Rack, moduleType: RackModuleType, colour: string): HeaderButton {
    return {
      width: 32,
      render(context: CanvasRenderingContext2D): void {
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