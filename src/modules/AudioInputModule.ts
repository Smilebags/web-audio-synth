import AbstractRackModule from "./AbstractRackModule.js";

export default class AudioInputModule extends AbstractRackModule {
  type: string = "AudioInput";
  name = "Audio In";
  private audioSourceNode: MediaStreamAudioSourceNode | null = null;

  constructor(
    private context: AudioContext) {
    super();
    navigator.getUserMedia( {audio:true}, (stream) => {
      this.audioSourceNode = this.context.createMediaStreamSource( stream );
      this.addPlug(this.audioSourceNode, "Microphone", "out");
    }, () => {});
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}