import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract, displayFreq } from "../util.js";

export default class OscillatorModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Oscillator';
  private osc: OscillatorNode;
  private vo: AudioWorkletNode;
  private voCoarseParam?: AudioParam;
  private voltageOffset: number;

  private initialVoltage: number | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    const { oscType = 'sine' } = params;
    const { voltageOffset = Math.log2(440) } = params;

    this.context = context;
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = 0;
    this.osc.type = oscType;
    this.osc.start();
    this.vo = new AudioWorkletNode(this.context, 'volt-per-octave-processor');
    this.vo.connect(this.osc.frequency);

    this.voltageOffset = voltageOffset;

    this.voCoarseParam = this.vo.parameters.get('coarse');
    if (this.voCoarseParam) {
      this.voCoarseParam.value = this.voltageOffset;
      this.addPlug(this.voCoarseParam, 'V/O In', 'in', 0);
    }

    this.addPlug(this.osc, 'Out', 'out', 1);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
    this.addEventListener('mouseup', (e: Vec2) => {this.handleMouseup()});
  }

  handleMousedown(mousedownEvent: Vec2): void {
    if (this.isInModeSelectRegion(mousedownEvent)) {
      this.handleModeSelect(mousedownEvent);
      return;
    }
    if (!this.isInFreqBox(mousedownEvent)) {
      return;
    }
    this.mousedownPos = mousedownEvent;
    this.initialVoltage = this.voltageOffset;
  }
  
  handleMousemove(mousemoveEvent: Vec2): void {
    this.mousemovePos = mousemoveEvent;
    if (!this.mousedownPos || !this.initialVoltage) {
      return;
    }
    const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
    this.voltageOffset = this.initialVoltage + (relativeYPos / 2**8 );
    if (this.voCoarseParam) {
      this.voCoarseParam.value = this.voltageOffset;
    }   
  }

  handleMouseup(): void {
    this.mousemovePos = null;
    this.mousedownPos = null;
    this.initialVoltage = null;
  }

  isInModeSelectRegion(pos: Vec2): boolean {
    return pos.y > 125 && pos.y < 280;
  }

  handleModeSelect(pos: Vec2): void {
    if (pos.y < 125 || pos.y > 280) {
      return;
    }
    if (pos.y >= 125 && pos.y <= 160) {
      this.osc.type = 'sine';
      return;
    }
    if (pos.y >= 165 && pos.y <= 200) {
      this.osc.type = 'triangle';
      return;
    }
    if (pos.y >= 205 && pos.y <= 240) {
      this.osc.type = 'sawtooth';
      return;
    }
    if (pos.y >= 245 && pos.y <= 280) {
      this.osc.type = 'square';
    }
  }

  isInFreqBox(pos: Vec2): boolean {
    return pos.y >= 300;
  }

  render(renderContext: CanvasRenderingContext2D): void {
    this.renderModeButtons(renderContext);
    const text = this.voCoarseParam
      ? displayFreq(2 ** this.voCoarseParam.value)
      : '0';
    this.renderDial(
      renderContext,
      {x:this.width/2, y: 350},
      40,
      this.voltageOffset,
      text,
    );
    super.render(renderContext);
  }

  renderModeButtons(renderContext: CanvasRenderingContext2D): void {
    const padding = 5;
    this.renderButton(
      renderContext,
      {x: padding, y: 120+padding},
      {x: this.width-(2*padding), y: 40-padding},
      'Sine',
      this.osc.type === 'sine'
    );
    this.renderButton(
      renderContext,
      {x: padding, y: 160+padding},
      {x: this.width-(2*padding), y: 40-padding},
      'Tri',
      this.osc.type === 'triangle'
    );
    this.renderButton(
      renderContext,
      {x: padding, y: 200+padding},
      {x: this.width-(2*padding), y: 40-padding},
      'Saw',
      this.osc.type === 'sawtooth'
    );
    this.renderButton(
      renderContext,
      {x: padding, y: 240+padding},
      {x: this.width-(2*padding), y: 40-padding},
      'Square',
      this.osc.type === 'square'
    );
  }

  // renderWheel(renderContext: CanvasRenderingContext2D): void {
  //   renderContext.save();
  //   renderContext.fillStyle = '#303030';
  //   renderContext.beginPath();
  //   renderContext.arc(this.width/2, 350, 40, 0, 2 * Math.PI);
  //   renderContext.fill();
  //   renderContext.strokeStyle = '#404040';
  //   renderContext.lineWidth = 4;
  //   renderContext.beginPath();
  //   renderContext.moveTo(this.width/2, 350);
  //   const offset = {
  //     x: Math.sin(this.voltageOffset) * 40,
  //     y: Math.cos(this.voltageOffset) * 40,
  //   };
  //   renderContext.lineTo((this.width/2) + offset.x, 350 - offset.y);
  //   renderContext.stroke();
  //   renderContext.restore();
  // }

  toParams(): Object {
    return {
      ...super.toParams(),
      oscType: this.osc.type,
      voltageOffset: this.voltageOffset,
    };
  }
}