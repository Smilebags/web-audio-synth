import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types.js";

export default class SequencerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Sequencer';
  private states: boolean[];
  private currentIndex: number;
  private lowVoltage: number;
  private highVoltage: number;
  private tickInterval: number;
  private voltageNode: ConstantSourceNode;
  private buttonSize: number = 16;
  private topOffset: number = 30;
  private buttonInterval: number = 18;

  constructor(
    context: AudioContext,
    stepCount: number = 16,
  ) {
    super();

    this.context = context;
    
    this.states = [];
    this.currentIndex = 0;
    this.lowVoltage = 0;
    this.highVoltage = 1;
    this.tickInterval = 200;

    this.voltageNode = this.context.createConstantSource();
    this.voltageNode.offset.value = 0;
    this.voltageNode.start();

    for (let i = 0; i < stepCount; i++) {
      this.states.push(false);
    }
    
    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    setInterval(() => this.tick(), this.tickInterval);


    this.addPlug(this.voltageNode, 'Out', 'out', 6);
  }

  handleMousedown(mousedownPosition: Vec2): void {
    const selectedButtonIndex = this.getCollidedButtonIndex(mousedownPosition);
    if (selectedButtonIndex !== -1) {
      this.states[selectedButtonIndex] = !this.states[selectedButtonIndex];
    }
  }

  get buttonCount() {
    return this.states.length;
  }

  getButtonPositionByIndex(index: number): Vec2 {
    return {
      x: (this.width / 2) - (this.buttonSize / 2),
      y: this.topOffset + (index * this.buttonInterval),
    };
  }

  getCollidedButtonIndex(pos: Vec2): number {
    return this.states.findIndex((state, index) => {
      const buttonPos = this.getButtonPositionByIndex(index);
      return buttonPos.x < pos.x
        && (buttonPos.x + this.buttonSize) > pos.x
        && buttonPos.y < pos.y
        && (buttonPos.y + this.buttonSize) > pos.y;
    });
  }

  tick() {
    this.currentIndex = (this.currentIndex + 1) % this.buttonCount;

    if(this.states[this.currentIndex]) {
      this.voltageNode.offset.value = this.highVoltage;
    } else {
      this.voltageNode.offset.value = this.lowVoltage;
    }
  }

  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);

    this.states.forEach((state, index) => {
      renderContext.fillStyle = state ? '#A04040' : '#444040';
      if (this.currentIndex === index) {
        renderContext.fillStyle = state ? '#F04040' : '#A04040';
      }
      const buttonPos = this.getButtonPositionByIndex(index);
      renderContext.fillRect(
        buttonPos.x,
        buttonPos.y,
        this.buttonSize,
        this.buttonSize,
      );
    });
  }
}
