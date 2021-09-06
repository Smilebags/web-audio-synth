import AbstractRackModule from "./AbstractRackModule.js";
export default class AudioInputModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.context = context;
        this.type = "AudioInput";
        this.name = "Audio In";
        this.audioSourceNode = null;
        navigator.getUserMedia({ audio: true }, (stream) => {
            this.audioSourceNode = this.context.createMediaStreamSource(stream);
            this.addPlug({ param: this.audioSourceNode, name: "Microphone", type: "out" });
        }, () => { });
    }
}
