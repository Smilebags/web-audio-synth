import AbstractRackModule from "./AbstractRackModule.js";
export default class RecorderModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Output';
        this.name = 'Out + Record';
        this.recorderBuffer = [];
        this.context = context;
        this.input = this.context.createGain();
        this.volumeReduction = this.context.createGain();
        this.volumeReduction.gain.value = 0.1;
        this.mediaStreamNode = this.context.createMediaStreamDestination();
        // @ts-ignore
        this.mediaRecorder = new MediaRecorder(this.mediaStreamNode.stream);
        this.mediaRecorder.onstop = () => { };
        this.mediaRecorder.ondataavailable = (event) => {
            this.recorderBuffer.push(event.data);
        };
        this.input.connect(this.volumeReduction);
        this.volumeReduction.connect(this.mediaStreamNode);
        this.volumeReduction.connect(this.context.destination);
        this.addPlug({ param: this.input, name: 'In', type: 'in' });
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
    }
    handleMousedown(pos) {
        if (pos.y > 300) {
            this.handleSaveClick();
            return;
        }
        if (pos.y > 200) {
            this.handleStartStopClick();
            return;
        }
    }
    handleStartStopClick() {
        if (this.mediaRecorder.state === 'recording') {
            this.stopRecording(false);
            return;
        }
        this.startRecording();
    }
    handleSaveClick() {
        this.stopRecording(true);
    }
    stopRecording(save) {
        if (save) {
            this.mediaRecorder.onstop = () => this.downloadFile();
        }
        if (this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        setTimeout(() => {
            this.mediaRecorder.onstop = () => { };
        }, 0);
    }
    downloadFile() {
        const prefix = 'web-audio-synth';
        const extension = 'wav';
        const dateString = this.makeDateString(new Date());
        const filename = `${prefix}-${dateString}.${extension}`
            .replace(' ', '')
            .replace(/[\/:,]/g, '-');
        var blob = new Blob(this.recorderBuffer, { 'type': 'audio/wav; codecs=0' });
        const dlNode = document.createElement('a');
        dlNode.href = URL.createObjectURL(blob);
        dlNode.download = filename;
        dlNode.click();
    }
    makeDateString(date) {
        const twoDigits = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const rest = [
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
        ].map(twoDigits);
        const parts = [year, ...rest];
        return parts.join('-');
    }
    startRecording() {
        this.recorderBuffer.length = 0;
        this.mediaRecorder.start();
    }
    render(renderContext) {
        super.render(renderContext);
        this.renderButton(renderContext, { x: 5, y: 205 }, { x: 90, y: 90 }, this.mediaRecorder.state === 'recording' ? 'Discard' : 'Start', this.mediaRecorder.state === 'recording');
        this.renderButton(renderContext, { x: 5, y: 305 }, { x: 90, y: 90 }, 'Save', this.mediaRecorder.state === 'recording');
    }
}
