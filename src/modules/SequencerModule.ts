import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class SequencerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Sequencer';
  private buttonSize: number = 16;
  private topOffset: number = 30;
  private buttonInterval: number = 18;

  private sequencerProcessor: AudioWorkletNode;

  constructor(
    context: AudioContext,
    {
      stepCount = 16,
      tickInterval = 200,
    } : {
      stepCount?: number,
      tickInterval?: number,
    }
  ) {
    super();

    this.context = context;
    
    this.sequencerProcessor = new AudioWorkletNode(this.context, 'sequencer-processor');
    

    // this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});

    this.addPlug(this.sequencerProcessor, 'Step', 'in', 6);
    this.addPlug(this.sequencerProcessor, 'Out', 'out', 7);
  }

  // handleMousedown(mousedownPosition: Vec2): void {
  //   const selectedButtonIndex = this.getCollidedButtonIndex(mousedownPosition);
  //   if (selectedButtonIndex !== -1) {
  //     this.states[selectedButtonIndex] = !this.states[selectedButtonIndex];
  //   }
  // }

  // get buttonCount() {
  //   return this.states.length;
  // }

  // getButtonPositionByIndex(index: number): Vec2 {
  //   // if (this.buttonCount <= 16) {
  //   //   return {
  //   //     x: (this.width / 2) - (this.buttonSize / 2),
  //   //     y: this.topOffset + (index * this.buttonInterval),
  //   //   };
  //   // }

  //   const rowCount = Math.ceil(this.buttonCount / 16);
  //   const rowNumber = index % rowCount;
  //   const columnNumber = Math.floor(index / rowCount);

  //   const xPosition = (this.width / 2)
  //     - ((rowCount * this.buttonInterval) / 2)
  //     + (rowNumber * this.buttonInterval);

  //   const yPosition = this.topOffset + (columnNumber * this.buttonInterval);

  //   return {
  //     x: xPosition,
  //     y: yPosition,
  //   };
  // }

  // getCollidedButtonIndex(pos: Vec2): number {
  //   return this.states.findIndex((state, index) => {
  //     const buttonPos = this.getButtonPositionByIndex(index);
  //     return buttonPos.x < pos.x
  //       && (buttonPos.x + this.buttonSize) > pos.x
  //       && buttonPos.y < pos.y
  //       && (buttonPos.y + this.buttonSize) > pos.y;
  //   });
  // }


  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);

    // this.states.forEach((state, index) => {
    //   renderContext.fillStyle = state ? '#A04040' : '#444040';
    //   if (this.currentIndex === index) {
    //     renderContext.fillStyle = state ? '#F04040' : '#A04040';
    //   }
    //   const buttonPos = this.getButtonPositionByIndex(index);
    //   renderContext.fillRect(
    //     buttonPos.x,
    //     buttonPos.y,
    //     this.buttonSize,
    //     this.buttonSize,
    //   );
    // });
  }

  toParams(): any {
    return {
      type: this.type,
      // stepCount: this.states.length,
      // tickInterval: this.tickInterval,
    }
  }
}
