import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class RecorderModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  input: MediaStreamAudioDestinationNode;
  // @ts-ignore
  mediaRecorder: MediaRecorder;
  recorderBuffer: any[] = [];
  type: string = 'Recorder';
  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.input = this.context.createMediaStreamDestination();
    // @ts-ignore
    this.mediaRecorder = new MediaRecorder(this.input.stream);
    this.startRecording();
    this.mediaRecorder.ondataavailable = (event: any) => {
      this.recorderBuffer.push(event.data);
    };
    this.mediaRecorder.onstop  = () => this.downloadFile();

    this.addPlug(this.input, 'Record', 'in');
    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown()});
  }
  handleMousedown() {
    this.mediaRecorder.stop();
  }

  downloadFile() {
    const prefix = 'web-audio-synth'
    const extension = 'wav';
    const now = new Date();
    const date = now.toLocaleTimeString(undefined, {
      // @ts-ignore
      dateStyle: 'short',
      timeStyle: 'medium',
    });
    const filename = `${prefix}-${date}.${extension}`
      .replace(' ', '')
      .replace(/[\/:,]/g, '-');
    
    var blob = new Blob(this.recorderBuffer, { 'type' : 'audio/wav; codecs=0' });
    const dlNode = document.createElement('a');
    dlNode.href = URL.createObjectURL(blob);
    dlNode.download = filename;
    dlNode.click();
    this.startRecording();
  }

  startRecording() {
    this.recorderBuffer.length = 0;
    this.mediaRecorder.start();
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}