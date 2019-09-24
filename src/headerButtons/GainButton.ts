import HeaderButton from "../types/HeaderButton";
import Rack from "../Rack";

export default class GainButton implements HeaderButton {
  constructor(private rack: Rack) {}
  width: number = 32;
  render(context: CanvasRenderingContext2D): void {
    context.save();
    context.fillStyle = '#ff9900';
    context.fillRect(8, 8, 16, 16);
    context.restore();
  }
  handlePress() {
    const newGain = this.rack.rackModuleFactory.createModule('Gain', {});
    this.rack.addModule(newGain);
  }
}