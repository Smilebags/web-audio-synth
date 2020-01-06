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
  private in: GainNode;
  private reverbs: ConvolverNode[] = [];
  private impulseResponseUrls = [
    'static/Basement.m4a',
    'static/ErrolBrickworksKiln.m4a',
    'static/ElvedenHallLordsCloakroom.m4a',
    'static/ElvedenHallMarbleHall.m4a',
  ];
  private reverbNames: string[] = [
    'Tiny',
    'Small',
    'Big',
    'Huge',
  ];

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);

    this.context = context;

    this.in = this.context.createGain();
    this.addPlug(this.in, 'In', 'in', 0);

    this.impulseResponseUrls.forEach((impulseResponseUrl, index) => {
      this.reverbs[index] = this.context.createConvolver();
      getImpulseBuffer(context, impulseResponseUrl).then((arrayBuffer) => {
        this.reverbs[index].buffer = arrayBuffer;
        this.addPlug(this.reverbs[index], this.reverbNames[index], 'out', index + 1);
        this.in.connect(this.reverbs[index]);
      });
    });
  }
}