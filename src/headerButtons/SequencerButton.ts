import HeaderButton from "../types/HeaderButton";
import Rack from "../Rack";

export default class SequencerButton implements HeaderButton {
  constructor(private rack: Rack) {}
  width: number = 32;
  render(context: CanvasRenderingContext2D): void {
    context.save();
    context.fillStyle = '#9900ff';
    context.fillRect(8, 8, 16, 16);
    context.restore();
  }
  handlePress() {
    const newGain = this.rack.rackModuleFactory.createModule('StepSequencer', {});
    this.rack.addModule(newGain);
  }
}