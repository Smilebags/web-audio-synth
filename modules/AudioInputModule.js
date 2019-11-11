import AbstractRackModule from "./AbstractRackModule.js";
export default class AudioInputModule extends AbstractRackModule {
    constructor(context) {
        super();
        this.context = context;
        this.type = "AudioInput";
        this.name = "Audio In";
        this.audioSourceNode = null;
        navigator.getUserMedia({ audio: true }, (stream) => {
            this.audioSourceNode = this.context.createMediaStreamSource(stream);
            this.addPlug(this.audioSourceNode, "Microphone", "out");
        }, () => { });
    }
    toParams() {
        return {
            type: this.type,
        };
    }
}
