import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

const BUFFER_LENGTH = 2048;

export default class ViewerModule extends AbstractRackModule {
  width = 400;
  context: AudioContext;
  type: string = 'Viewer';
  private viewerProcessor: AudioWorkletNode;
  private noopGain: GainNode;
  sampleBuffer?: Float32Array;
  sampleHead?: number;

  constructor(
    context: AudioContext,
    params: any,
  ) {
    super(params);
    this.context = context;
    
    this.noopGain = this.context.createGain();
    this.noopGain.gain.value = 0;
    this.noopGain.connect(this.context.destination);
    
    this.viewerProcessor = new AudioWorkletNode(this.context, 'viewer-processor');
    this.viewerProcessor.port.onmessage = (message: any) => this.handleProcessorMessage(message);
    this.viewerProcessor.connect(this.noopGain);

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});

    this.addPlug(this.viewerProcessor, 'In', 'in');
    setInterval(() => {
      this.getSamples();
    }, 50);
    this.getSamples();
  }


  handleProcessorMessage(message: {data: {type: string, payload: any}}) {
    switch (message.data.type) {
      case 'samples':
        this.handleSetSamples(message.data.payload);
        break;
      default:
        break;
    }
  }

  handleSetSamples(payload: { buffer: Float32Array, head: number }): void {
    this.sampleBuffer = payload.buffer;
    this.sampleHead = payload.head;
  }

  getSamples() {
    this.viewerProcessor.port.postMessage({
      type: 'getSamples',
      payload: null,
    });
  }

  render(context: CanvasRenderingContext2D) {
    super.render(context);
    if(this.sampleBuffer) {
      context.beginPath();
      for (let i = 0; i < BUFFER_LENGTH; i++) {
        const xProgress = (i / BUFFER_LENGTH) * this.width;
        const samplePosition = ((this.sampleHead || 0) + ((i / BUFFER_LENGTH) * BUFFER_LENGTH)) % BUFFER_LENGTH;
        const yPos = 200 + ((this.sampleBuffer[samplePosition]) * 200);
        context.lineTo(xProgress, yPos);
      }
      context.strokeStyle = '#ffffff';
      context.stroke();
    }
  }
}
