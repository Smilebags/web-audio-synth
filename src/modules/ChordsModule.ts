import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { distance } from "../util.js";

interface CallbackDial {
  position: Vec2,
  radius: number,
  value: () => number,
  changeCallback: (value: number) => any;
}

export default class ChordsModule extends AbstractRackModule {
  width: number = 200;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Chords';
  
  private processor: AudioWorkletNode;
  private noopGain: GainNode;
  private channelOutputs: GainNode[] = [];

  private activeStep: number = 0;
  private callbackDials: CallbackDial[] = [];
  private channelLevels = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private mousedownDialIndex: [number, number] | null = null;
  private mousedownDialInitialValue: number | null = null;

  private gridXOffset: number = 30;
  private gridXSpan: number = 30;
  private gridYOffset: number = 70;
  private gridYSpan: number = 30;

  private dialRadius: number = 13;

  constructor(context: AudioContext) {
    super();
    this.context = context;

    this.processor = new AudioWorkletNode(this.context, 'chords-processor', {numberOfOutputs: 4});
    this.noopGain = this.context.createGain();
    this.noopGain.gain.value = 0;
    this.noopGain.connect(this.context.destination);
    
    this.processor.port.onmessage = (message: any) => this.handleProcessorMessage(message);
    this.processor.connect(this.noopGain);

    this.channelOutputs[0] = this.context.createGain();
    this.channelOutputs[1] = this.context.createGain();
    this.channelOutputs[2] = this.context.createGain();
    this.channelOutputs[3] = this.context.createGain();

    this.processor.connect(this.channelOutputs[0], 0);
    this.processor.connect(this.channelOutputs[1], 1);
    this.processor.connect(this.channelOutputs[2], 2);
    this.processor.connect(this.channelOutputs[3], 3);
    
    const resetTriggerParam = this.processor.parameters.get('resetTrigger')!;
    const stepTriggerParam = this.processor.parameters.get('stepTrigger')!;
    
    this.addPlug(
      stepTriggerParam,
      '',
      'in',
      null,
      'fixed',
      {x: 30, y: 40},
    );
    const stepLabel = {
      getText: () => 'Step',
      position: {x: 50, y: 43},
      align: 'left' as CanvasTextAlign,
    };
    this.addLabel(stepLabel);

    this.addPlug(
      resetTriggerParam,
      '',
      'in',
      null,
      'fixed',
      {x: 120, y: 40},
    );
    const resetLabel = {
      getText: () => 'Reset',
      position: {x: 140, y: 43},
      align: 'left' as CanvasTextAlign,
    };
    this.addLabel(resetLabel);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        this.addCallbackDial(
          {
            x: this.gridXOffset + (this.gridXSpan * x),
            y: this.gridYOffset + (this.gridYSpan * y),
          },
          this.dialRadius,
          () => this.channelLevels[x][y],
          (value) => this.setValue(x, y, value),
        );
      }
      this.addPlug(
        this.noopGain,
        '',
        'in',
        null,
        'fixed',
        {x: 150, y: this.gridYOffset + (this.gridYSpan * y)},
      );
    }
    for (let x = 0; x < 4; x++) {
      this.addPlug(
        this.channelOutputs[x],
        '',
        'out',
        null,
        'fixed',
        {x: this.gridXOffset + (this.gridXSpan * x), y: 380},
      );
    }

    this.addDefaultEventListeners();
  }

  handleMousedown(mousedownPosition: Vec2): void {
    const selectedDialIndex = this.getCollidedDialIndex(mousedownPosition);
    if (selectedDialIndex === null) {
      return;
    }

    this.mousedownPos = mousedownPosition;
    this.mousedownDialIndex = selectedDialIndex;
    this.mousedownDialInitialValue = this.channelLevels[selectedDialIndex[0]][selectedDialIndex[1]];
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
    const valueDifference = pixelDifference / 2 ** 8;
    const newValue = this.mousedownDialInitialValue + valueDifference;
    this.setValue(
      this.mousedownDialIndex[0],
      this.mousedownDialIndex[1],
      newValue,
    );
  }

  handleMouseup(): void {
    this.mousedownDialIndex = null;
    this.mousedownDialInitialValue = null;
  }

  getCollidedDialIndex(pos: Vec2): [number, number] | null {
    for (let x = 0; x < this.channelLevels.length; x++) {
      for (let y = 0; y < this.channelLevels[x].length; y++) {
        const dialPosition = {
          x: this.gridXOffset + (this.gridXSpan * x),
          y: this.gridYOffset + (this.gridYSpan * y),
        };
        if (distance(pos, dialPosition) < this.dialRadius) {
          return [x, y];
        }
      }
    }
    return null;
  }

  setValue(channel: number, index: number, value: number): void {
    this.channelLevels[channel][index] = value;
    const payload = {
      channel,
      index,
      value,
    };
    this.processor.port.postMessage({type: 'setLevel', payload});
  }

  handleProcessorMessage(message: {data: {type: string, payload: any}}) {
    switch (message.data.type) {
      case 'setActiveStep':
        this.handleSetActiveStep(message.data.payload);
        break;
      default:
        break;
    }
  }

  handleSetActiveStep(index: number): void {
    this.activeStep = index;
  }

  addCallbackDial(
    position: Vec2,
    radius: number = 10,
    value: () => number,
    changeCallback: (value: number) => any,
  ): void {
    this.callbackDials.push({
      position,
      radius,
      value,
      changeCallback,
    });
  }

  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);
    for (let i = 0; i < 8; i++) {
      const pos = {x: 175, y: this.gridYOffset + (this.gridYSpan * i)};
      this.renderLed(renderContext, pos, 5, Number(this.activeStep === i));
    }
    this.callbackDials.forEach((callbackDial) => {
      this.renderDial(
        renderContext,
        callbackDial.position,
        callbackDial.radius,
        callbackDial.value() * 2 * Math.PI,
        '',
      );
    });
  }

}