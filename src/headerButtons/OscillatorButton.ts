import HeaderButton from "../types/HeaderButton";
import Rack from "../Rack";

export default class OscillatorButton implements HeaderButton {
  constructor(private rack: Rack) {}
  width: number = 32;
  render(context: CanvasRenderingContext2D): void {
    context.drawImage(
      // @ts-ignore
      window.oscImage,
      0,
      0,
      this.width,
      this.width,
    );
  }
  handlePress() {
    const newOscillator = this.rack.rackModuleFactory.createModule('Oscillator', {});
    this.rack.addModule(newOscillator);
  }
}