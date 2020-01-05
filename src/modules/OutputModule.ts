import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";
import { Vec2 } from "../types/Vec2.js";

export default class RecorderModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  
  type: string = 'Output';
  name: string = 'Out + Record';
  
  private input: GainNode;
  private mediaStreamNode: MediaStreamAudioDestinationNode;
  // @ts-ignore
  private mediaRecorder: MediaRecorder;
  private recorderBuffer: any[] = [];

  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.input = this.context.createGain();
    this.mediaStreamNode = this.context.createMediaStreamDestination();
    // @ts-ignore
    this.mediaRecorder = new MediaRecorder(this.mediaStreamNode.stream);
    this.mediaRecorder.onstop  = () => {}; 
    this.mediaRecorder.ondataavailable = (event: any) => {
      this.recorderBuffer.push(event.data);
    };

    this.input.connect(this.mediaStreamNode);
    this.input.connect(this.context.destination);

    this.addPlug(this.input, 'In', 'in');
    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
  }

  handleMousedown(pos: Vec2) {
    if(pos.y > 300) {
      this.handleSaveClick();
      return;
    }
    if(pos.y > 200) {
      this.handleStartStopClick();
      return;
    }
  }

  handleStartStopClick() {
    if(this.mediaRecorder.state === 'recording') {
      this.stopRecording(false);
      return;
    }
    this.startRecording();
  }

  handleSaveClick() {
    this.stopRecording(true);  
  }

  stopRecording(save: boolean) {
    if(save) {
      this.mediaRecorder.onstop  = () => this.downloadFile();    
    }
    if(this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    setTimeout(() => {
      this.mediaRecorder.onstop  = () => {}; 
    }, 0);
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
  }

  startRecording() {
    this.recorderBuffer.length = 0;
    this.mediaRecorder.start();
  }

  render(renderContext: CanvasRenderingContext2D): void {
    super.render(renderContext);
    this.renderButton(
      renderContext,
      {x: 5, y: 205},
      {x: 90, y: 90},
      this.mediaRecorder.state === 'recording' ? 'Discard' : 'Start',
      this.mediaRecorder.state === 'recording',
    );
    this.renderButton(
      renderContext,
      {x: 5, y: 305},
      {x: 90, y: 90},
      'Save',
      this.mediaRecorder.state === 'recording',
    );
  }
}