import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";
import { subtract } from "../util.js";

const getImpulseBuffer = (audioContext: AudioContext, impulseUrl: string) => {
  return fetch(impulseUrl)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
}

export default class ReverbModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Reverb';
  private reverb: ConvolverNode;
  private impulseResponseUrl: string;

  private mousedownPos: Vec2 | null = null;
  private mousemovePos: Vec2 | null = null;

  constructor(
    context: AudioContext,
    {
      impulseResponseUrl = 'static/ElvedenHallMarbleHall.m4a'
    }: {
      impulseResponseUrl?: string,

    }) {
    super();

    this.context = context;
    this.impulseResponseUrl = impulseResponseUrl;
    this.reverb = this.context.createConvolver();
    getImpulseBuffer(context, impulseResponseUrl).then((arrayBuffer) => {
      this.reverb.buffer = arrayBuffer;
      this.addPlug(this.reverb, 'Out', 'out', 2);
    });


    this.addPlug(this.reverb, 'In', 'in', 0);

    // this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    // this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  // handleMousedown(mousedownEvent: Vec2): void {
  //   if (!this.isInFreqBox(mousedownEvent)) {
  //     return;
  //   }
  //   this.mousedownPos = mousedownEvent;
  // }

  // handleMousemove(mousemoveEvent: Vec2): void {
  //   this.mousemovePos = mousemoveEvent;
  //   if (!this.mousedownPos || !this.initialDelay) {
  //     return;
  //   }
  //   const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
  //   this.reverb.delayTime.value = this.initialDelay + (relativeYPos / 2**6 );
  // }

  // isInFreqBox(pos: Vec2): boolean {
  //   return pos.y >= 200;
  // }

  toParams(): any {
    return {
      type: this.type,
      impulseResponseUrl: this.impulseResponseUrl,
    };
  }
}