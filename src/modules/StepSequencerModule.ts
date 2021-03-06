import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class StepSequencerModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'StepSequencer';
  name: string = 'Step Seq.';
  private buttonSize: number = 16;
  private topOffset: number = 30;
  private buttonInterval: number = 18;

  private levels: boolean[];
  private currentIndex: number = 0;

  private sequencerProcessor: AudioWorkletNode;
  private noopGain: GainNode;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    const levels = params.levels || [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const { tickInterval = 200 } = params;
    this.context = context;
    
    this.noopGain = this.context.createGain();
    this.noopGain.gain.value = 0;
    this.noopGain.connect(this.context.destination);
    
    this.sequencerProcessor = new AudioWorkletNode(this.context, 'sequencer-processor');
    this.sequencerProcessor.port.onmessage = (message: any) => this.handleSequencerProcessorMessage(message);
    this.sequencerProcessor.connect(this.noopGain);

    this.levels = levels;
    this.sendLevels();

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});

    this.addPlug({ param: this.sequencerProcessor, name: 'Clock', type: 'in', order: 3 });
    const stepTriggerParam = this.sequencerProcessor.parameters.get('stepTrigger');
    if(stepTriggerParam) {
      this.addPlug({ param: stepTriggerParam, name: 'Step', type: 'in', order: 4 });
    }
    const resetTriggerParam = this.sequencerProcessor.parameters.get('resetTrigger');
    if(resetTriggerParam) {
      this.addPlug({ param: resetTriggerParam, name: 'Reset', type: 'in', order: 5 });
    }
    this.addPlug({ param: this.sequencerProcessor, name: 'Out', type: 'out', order: 6 });
  }

  handleMousedown(mousedownPosition: Vec2): void {
    const selectedButtonIndex = this.getCollidedButtonIndex(mousedownPosition);
    if (selectedButtonIndex !== -1) {
      this.toggleButton(selectedButtonIndex);
      
    }
  }

  handleSequencerProcessorMessage(message: {data: {type: string, payload: any}}) {
    switch (message.data.type) {
      case 'setActiveTick':
        this.handleSetActiveTick(message.data.payload);
        break;
      default:
        break;
    }
  }

  handleSetActiveTick(index: number): void {
    this.currentIndex = index;
  }

  toggleButton(index: number): void {
    this.levels[index] = !this.levels[index];
    this.sendLevels();
  }

  sendLevels(): void {
    this.sequencerProcessor.port.postMessage({type: 'setLevels', payload: this.levels});
  }

  get buttonCount() {
    return this.levels.length;
  }

  getButtonPositionByIndex(index: number): Vec2 {
    const rowCount = Math.ceil(this.buttonCount / 4);
    const rowNumber = index % rowCount;
    const columnNumber = Math.floor(index / rowCount);

    const xPosition = (this.width / 2)
      - ((rowCount * this.buttonInterval) / 2)
      + (rowNumber * this.buttonInterval);

    const yPosition = this.topOffset + (columnNumber * this.buttonInterval);

    return {
      x: xPosition,
      y: yPosition,
    };
  }

  getCollidedButtonIndex(pos: Vec2): number {
    return this.levels.findIndex((state, index) => {
      const buttonPos = this.getButtonPositionByIndex(index);
      return buttonPos.x < pos.x
        && (buttonPos.x + this.buttonSize) > pos.x
        && buttonPos.y < pos.y
        && (buttonPos.y + this.buttonSize) > pos.y;
    });
  }

  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);

    this.levels.forEach((state, index) => {
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

  toParams(): Object {
    return {
      ...super.toParams(),
      levels: this.levels,
    };
  }
}
