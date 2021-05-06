import AbstractRackModule from "./AbstractRackModule.js";
import AsyncWorkerPort from "../AsyncWorkerPort.js";
import { Vec2 } from "../types/Vec2.js";

export default class SampleLoaderModule extends AbstractRackModule {
  type: string = 'SampleLoader';

  private sampler: AudioWorkletNode;
  private playTriggerParam: AudioParam;
  private startPosParam: AudioParam;
  private playbackRateParam: AudioParam;
  private asyncWorkerPort: AsyncWorkerPort;

  constructor(
    private context: AudioContext,
    params: any,
  ) {
    super(params);

    this.sampler = new AudioWorkletNode(this.context, 'sample-loader-processor');
    this.asyncWorkerPort = new AsyncWorkerPort(this.sampler.port);
    if (params.sampleData) {
      this.setSampleData(params.sampleData);
    }


    this.playTriggerParam = this.sampler.parameters.get('playTrigger')!;
    this.addPlug({ param: this.playTriggerParam, name: 'Play', type: 'in' });
    this.startPosParam = this.sampler.parameters.get('startPosition')!;
    this.addPlug({ param: this.startPosParam, name: 'Start', type: 'in' });
    this.playbackRateParam = this.sampler.parameters.get('playbackRate')!;
    this.addPlug({ param: this.playbackRateParam, name: 'Rate', type: 'in' });
    
    this.addPlug({ param: this.sampler, name: 'Out', type: 'out' });

    this.addEventListener('mousedown', (e: Vec2) => {this.handleMousedown(e)});
  }

  handleMousedown(e: Vec2): void {
    this.loadFileFromDisk();
  }

  private async loadFileFromDisk() {
    const buffer = await loadAudioFileToBuffer(this.context);
    await this.setSampleData(buffer);
  }

  private async getSampleData(): Promise<string> {
    const res = await this.asyncWorkerPort.postMessage({ type: 'getSampleData' }) as any;
    return res.payload.join(',');
  }

  private async setSampleData(sampleData: string | Float32Array) {
    if (sampleData instanceof Float32Array) {
      return this.asyncWorkerPort.postMessage({ type: 'setSampleData', payload: sampleData });
    }
    const buffer = new Float32Array(sampleData
      .split(',')
      .map(Number));
    await this.asyncWorkerPort.postMessage({ type: 'setSampleData', payload: buffer });
  }

  async toParams(): Promise<Object> {
    return {
      ...super.toParams(),
      sampleData: await this.getSampleData(),
    };
  }
}

function loadFile() {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.accept = 'audio/*';
    inputEl.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return reject();
      }
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        var contents = e.target?.result;
        if (!contents || typeof contents === 'string') {
          return reject();
        }
        resolve(contents);
      });
      reader.readAsArrayBuffer(file);
    });
    inputEl.click();
  });
}

async function loadAudioFileToBuffer(ctx: AudioContext) {
  const fileBuffer = await loadFile();
  const audioBuffer = await ctx.decodeAudioData(fileBuffer);
  return audioBuffer.getChannelData(0);
}