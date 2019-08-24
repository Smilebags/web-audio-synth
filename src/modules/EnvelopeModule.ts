import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types.js";
import { subtract } from "../util.js";

export default class EnvelopeModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  name: string = 'Envelope';
  private a: ConstantSourceNode;
  private d: ConstantSourceNode;
  private s: ConstantSourceNode;
  private r: ConstantSourceNode;
  private envelope: AudioWorkletNode;

  constructor(
    context: AudioContext,
    a: number = 0.01,
    d: number = 0.1,
    s: number = 0.1,
    r: number = 0.2,
  ) {
    super();

    this.context = context;
    this.a = this.context.createConstantSource();
    this.a.offset.value = a;
    this.d = this.context.createConstantSource();
    this.d.offset.value = d;
    this.s = this.context.createConstantSource();
    this.s.offset.value = s;
    this.r = this.context.createConstantSource();
    this.r.offset.value = r;

    this.envelope = new AudioWorkletNode(this.context, 'envelope-generator-processor');


    this.addPlug(this.envelope, 'Trigger', 'in', 0);
    this.addPlug(this.a.offset, 'A', 'in', 1);
    this.addPlug(this.d.offset, 'D', 'in', 2);
    this.addPlug(this.s.offset, 'S', 'in', 3);
    this.addPlug(this.r.offset, 'R', 'in', 4);
    this.addPlug(this.envelope, 'Out', 'out', 5);

    // this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
    // this.addEventListener('mousemove', (e: Vec2) => {this.handleMousemove(e)});
  }

  // handleMousedown(mousedownEvent: Vec2): void {
  //   if (!this.isInFreqBox(mousedownEvent)) {
  //     return;
  //   }
  //   this.mousedownPos = mousedownEvent;
  //   this.initialFreq = this.biquad.frequency.value;
  // }
  // handleMousemove(mousemoveEvent: Vec2): void {
  //   this.mousemovePos = mousemoveEvent;
  //   if (!this.mousedownPos || !this.initialFreq) {
  //     return;
  //   }
  //   const relativeYPos = subtract(this.mousedownPos, this.mousemovePos).y;
  //   this.biquad.frequency.value = this.initialFreq + (relativeYPos * 2 );
  // }
  // isInFreqBox(pos: Vec2): boolean {
  //   return pos.y >= 200;
  // }
}





// import RackModule from './RackModule.js';
// import Plug from './Plug.js';
// import Control from './Control.js';

// export default class EnvelopeRackModule extends RackModule {
//   constructor(rack) {
//     super(rack);
//     this.audioContext = rack.audioContext;

//     this.envelope = new AudioWorkletNode(this.audioContext, 'envelope-generator-processor');
    
//     this.rootEl = document.createElement('div');
//     this.rootEl.style.width = '100px';

    
//     this.inPlugEl = document.createElement('div');
//     this.inPlugEl.classList.add('plug');
//     this.inPlugEl.classList.add('in');
//     this.rootEl.appendChild(this.inPlugEl);

//     this.outPlugEl = document.createElement('div');
//     this.outPlugEl.classList.add('plug');
//     this.outPlugEl.classList.add('out');
//     this.rootEl.appendChild(this.outPlugEl);

//     this.inPlug = new Plug(this.envelope, this.inPlugEl, this.rack);
//     this.outPlug = new Plug(this.envelope, this.outPlugEl, this.rack);
//     this.registerPlug(this.inPlug);
//     this.registerPlug(this.outPlug);
//     this.registerModule(this.rootEl);
//   }
// }
