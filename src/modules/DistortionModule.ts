import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class DistortionModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Distortion';
  private waveshaper: WaveShaperNode;
  private driveAmount: ConstantSourceNode;
  private drivePreAmp: GainNode;
  private drivePostAmp: GainNode;
  private distortionAmount: number;
  private mathNode: AudioWorkletNode;
  private waveshaperCurve: Float32Array;


  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    const {distortionAmount = 4 } = params;
    this.context = context;
    this.waveshaper = this.context.createWaveShaper();
    this.waveshaperCurve = new Float32Array(this.context.sampleRate);
    this.updateWaveshaperCurve(distortionAmount);
    this.distortionAmount = distortionAmount;
    this.waveshaper.curve= this.waveshaperCurve;

    this.driveAmount = this.context.createConstantSource();
    this.driveAmount.offset.value = 1;
    this.driveAmount.start();
    this.drivePreAmp = this.context.createGain();
    this.drivePreAmp.gain.value = 0;
    this.drivePostAmp = this.context.createGain();
    this.drivePostAmp.gain.value = 0;
    this.mathNode = new AudioWorkletNode(this.context, 'math-processor', { numberOfOutputs: 5, numberOfInputs: 0 });
    const mathAIn = this.mathNode.parameters.get('aInput')!;
    const mathBIn = this.mathNode.parameters.get('bInput')!;

    mathAIn.value = 1;
    
    this.driveAmount.connect(this.drivePreAmp.gain);
    this.driveAmount.connect(mathBIn);
    this.mathNode.connect(this.drivePostAmp.gain, 3);
    this.drivePreAmp.connect(this.waveshaper);
    this.waveshaper.connect(this.drivePostAmp);
    // this.drivePreAmp.connect(this.drivePostAmp);

    this.addPlug(this.drivePreAmp, 'In', 'in');
    this.addDialPlugAndLabel(
      this.driveAmount.offset,
      this.driveAmount.offset,
      'Drive',
      'in',
      () => this.driveAmount.offset.value.toFixed(2),
    );
    this.addPlug(this.drivePostAmp, 'Out', 'out');
    // this.addPlug(this.driveAmount, 'Amt', 'out');
    // this.addPlug(this.drivePreAmp, 'Pre', 'out');
    // this.addPlug(this.drivePostAmp, 'Post', 'out');

    this.addDefaultEventListeners();
  }

  updateWaveshaperCurve(amount: number): void {
    this.makeDistortionCurve(amount * 25);
    // for (let i = 0; i < this.waveshaperCurve.length; i++) {
    //   const progress = i / this.waveshaperCurve.length;
    //   this.waveshaperCurve[i] = progress ** (1 / amount);
    // }
  }

  makeDistortionCurve(amount: number = 50): void {
    const sampleCount = this.context.sampleRate;
    const curve = this.waveshaperCurve;
    let deg = Math.PI / 180;
    let x;
    for (let i = 0; i < sampleCount; ++i ) {
      x = i * 2 / sampleCount - 1;
      curve[i] = ( 3 + amount ) * x * 20 * deg / ( Math.PI + amount * Math.abs(x) );
    }
    // return curve;
  };

  toParams(): Object {
    return {
      ...super.toParams(),
      distortionAmount: this.distortionAmount,
    };
  }
}