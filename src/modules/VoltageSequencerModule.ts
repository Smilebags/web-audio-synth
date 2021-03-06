import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { distance } from "../util/Vec2Math.js";

export default class VoltageSequencer extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'VoltageSequencer';
  name: string = 'Sequencer';
  private levels: number[];
  private currentIndex: number = 0;

  private topOffset = 40;
  private dialSpread = 24;
  private dialSize = 10;

  private mousedownDialIndex: number | null = null;
  private mousedownDialInitialValue: number | null = null;

  private sequencerProcessor: AudioWorkletNode;
  private noopGain: GainNode;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    const levels = params.levels || [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];

    this.context = context;
    
    this.noopGain = this.context.createGain();
    this.noopGain.gain.value = 0;
    this.noopGain.connect(this.context.destination);
    
    this.sequencerProcessor = new AudioWorkletNode(this.context, 'sequencer-processor');
    this.sequencerProcessor.port.onmessage = (message: any) => this.handleSequencerProcessorMessage(message);
    this.sequencerProcessor.connect(this.noopGain);

    this.levels = levels;
    this.sendLevels();

    this.addDefaultEventListeners();

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

  sendLevels(): void {
    this.sequencerProcessor.port.postMessage({type: 'setLevels', payload: this.levels});
  }

  handleMousedown(mousedownPosition: Vec2): void {
    const selectedDialIndex = this.getCollidedDialIndex(mousedownPosition);
    if (selectedDialIndex === -1) {
      return;
    }

    this.mousedownPos = mousedownPosition;
    this.mousedownDialIndex = selectedDialIndex;
    this.mousedownDialInitialValue = this.levels[selectedDialIndex];
  }

  handleMousemove(pos: Vec2): void {
    if (
      this.mousedownDialIndex === null
      || this.mousedownPos === null
      || this.mousedownDialInitialValue === null
    ) {
      return;
    }

    const pixelDifference = pos.y - this.mousedownPos.y;
    const valueDifference = pixelDifference / 2 ** 6;
    this.levels[this.mousedownDialIndex] = this.mousedownDialInitialValue + valueDifference;
    this.sendLevels();
  }


  handleMouseup(): void {
    this.mousedownDialIndex = null;
    this.mousedownDialInitialValue = null;
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

  get buttonCount() {
    return this.levels.length;
  }

  getDialPositionByIndex(index: number): Vec2 {
    const rowCount = Math.ceil(this.buttonCount / 4);
    const rowNumber = index % rowCount;
    const columnNumber = Math.floor(index / rowCount);

    const offsetFromCenter = (rowNumber - 1.5) * this.dialSpread;

    const xPosition = (this.width / 2) + offsetFromCenter;

    const yPosition = this.topOffset + (columnNumber * this.dialSpread);

    return {
      x: xPosition,
      y: yPosition,
    };
  }

  getCollidedDialIndex(pos: Vec2): number {
    return this.levels.findIndex((dialValue, index) => {
      const dialPos = this.getDialPositionByIndex(index);
      return distance(dialPos, pos) < this.dialSize;
    });
  }

  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);

    this.levels.forEach((state, index) => {
      const pos = this.getDialPositionByIndex(index);
      this.renderDial(renderContext, pos, this.dialSize, this.levels[index], '');
      this.renderLed(renderContext, pos, 3, Number(this.currentIndex === index));
    });
  }

  toParams(): Object {
    return {
      ...super.toParams(),
      levels: this.levels,
    };
  }
}
