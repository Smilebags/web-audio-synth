import AbstractRackModule from "./AbstractRackModule.js";
const BUFFER_LENGTH = 2048;
export default class ViewerModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.width = 400;
        this.type = 'Viewer';
        this.context = context;
        this.noopGain = this.context.createGain();
        this.noopGain.gain.value = 0;
        this.noopGain.connect(this.context.destination);
        this.viewerProcessor = new AudioWorkletNode(this.context, 'viewer-processor');
        this.viewerProcessor.port.onmessage = (message) => this.handleProcessorMessage(message);
        this.viewerProcessor.connect(this.noopGain);
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addPlug({ param: this.viewerProcessor, name: 'In', type: 'in' });
        setInterval(() => {
            this.getSamples();
        }, 50);
        this.getSamples();
    }
    handleProcessorMessage(message) {
        switch (message.data.type) {
            case 'samples':
                this.handleSetSamples(message.data.payload);
                break;
            default:
                break;
        }
    }
    handleSetSamples(payload) {
        this.sampleBuffer = payload.buffer;
        this.sampleHead = payload.head;
    }
    getSamples() {
        this.viewerProcessor.port.postMessage({
            type: 'getSamples',
            payload: null,
        });
    }
    render(context) {
        super.render(context);
        if (this.sampleBuffer) {
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
