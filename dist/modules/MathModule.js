import AbstractRackModule from "./AbstractRackModule.js";
export default class MathModule extends AbstractRackModule {
    constructor(context, params) {
        super(params);
        this.type = 'Math';
        this.context = context;
        this.mathNode = new AudioWorkletNode(this.context, 'math-processor', { numberOfOutputs: 5, channelCountMode: 'explicit', });
        console.log(this.mathNode.numberOfOutputs);
        console.log(this.mathNode.channelCount);
        this.aInNode = this.context.createConstantSource();
        this.aInNode.offset.value = 0;
        this.aInNode.start();
        this.bInNode = this.context.createConstantSource();
        this.bInNode.offset.value = 0;
        this.bInNode.start();
        const a = this.mathNode.parameters.get('a');
        const b = this.mathNode.parameters.get('b');
        this.aInNode.connect(a);
        this.bInNode.connect(b);
        this.addPlug({ param: this.aInNode.offset, name: 'A', type: 'in' });
        this.addPlug({ param: this.bInNode.offset, name: 'B', type: 'in' });
        this.addPlug({ param: this.mathNode, name: 'Subtract', type: 'out', channel: 0 });
        this.addPlug({ param: this.mathNode, name: 'Multiply', type: 'out', channel: 1 });
        this.addPlug({ param: this.mathNode, name: 'Divide', type: 'out', channel: 2 });
        this.addPlug({ param: this.mathNode, name: 'Mod', type: 'out', channel: 3 });
        this.addDefaultEventListeners();
    }
}
