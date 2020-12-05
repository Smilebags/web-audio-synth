import AbstractRackModule from "./AbstractRackModule.js";

export default class AudioInputModule extends AbstractRackModule {
  type: string = "AudioInput";
  name = "Audio In";
  private audioSourceNode: MediaStreamAudioSourceNode | null = null;

  constructor(
    private context: AudioContext,
    params: any,
  ) {
    super(params);
    navigator.getUserMedia( {audio:true}, (stream) => {
      this.audioSourceNode = this.context.createMediaStreamSource( stream );
      this.addPlug({ param: this.audioSourceNode, name: "Microphone", type: "out" });
    }, () => {});
  }
}
