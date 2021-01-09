import { BaseProcessor } from './BaseProcessor.js';

class EnvelopeGeneratorProcessor extends BaseProcessor {
  samplingFrequency = 44100;
  stage: 'off' | 'a' | 'd' | 's' | 'r' = 'off';
  value = 0;

  static get parameterDescriptors() {
    return [
      {
        name: 'a',
        defaultValue: 0.01,
        minValue: 0,
        maxValue: 1000,
      },
      {
        name: 'd',
        defaultValue: 0.2,
        minValue: 0,
      },
      {
        name: 's',
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
      },
      {
        name: 'r',
        defaultValue: 0.5,
        minValue: 0,
      },
      {
        name: 'cutoffValue',
        defaultValue: 0.8,
        minValue: 1e-5,
      },
    ];
  }

  attackSamples(attackValue: number) {
    return attackValue * this.samplingFrequency;
  }

  attackChangeAmount(attackValue: number) {
    return (1 / this.attackSamples(attackValue));
  }

  decaySamples(decayValue: number, sustainValue: number) {
    if (sustainValue === 1) {
      return 0;
    }
    return (decayValue * this.samplingFrequency) / (1 - sustainValue);
  }

  decayChangeAmount(decayValue: number, sustainValue: number) {
    return (1 / this.decaySamples(decayValue, sustainValue));
  }

  releaseSamples(releaseValue: number) {
    return (releaseValue * this.samplingFrequency);
  }

  releaseChangeAmount(releaseValue: number) {
    return (1 / this.releaseSamples(releaseValue));
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: AudioWorkletParameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0] || [];
    for (let i = 0; i < outputChannel.length; i++) {
      const a = this.getParameterValue(parameters, 'a', i);
      const d = this.getParameterValue(parameters, 'd', i);
      const s = this.getParameterValue(parameters, 's', i);
      const r = this.getParameterValue(parameters, 'r', i);
      outputChannel[i] = this.tick(inputChannel[i], parameters, i, a, d, s, r);
    }
    return true;
  }

  tick(inputValue: number, parameters: AudioWorkletParameters, sampleIndex: number, a: number, d: number, s: number, r: number) {
    const attackChangeAmount = this.attackChangeAmount(a);
    const decayChangeAmount = this.decayChangeAmount(d, s);
    const releaseChangeAmount = this.releaseChangeAmount(r);
    this.setState(inputValue, parameters, sampleIndex, a, d, s);
    switch (this.stage) {
      case 'a':
        this.value = Math.min(this.value + attackChangeAmount, 1);
        break;
      case 'd':
        this.value = Math.max(this.value - decayChangeAmount, s);
        break;
      case 's':
        this.value = s;
        break;
      case 'r':
        this.value = Math.max(this.value - releaseChangeAmount, 0);
        break;
      case 'off':
        this.value = 0;
        break;
      default:
        this.value = 0;
        break;
    }
    return this.value;
  }

  setState(inputValue: number, parameters: AudioWorkletParameters, sampleIndex: number, a: number, d: number, s: number) {
    if (inputValue >= this.getParameterValue(parameters, 'cutoffValue', sampleIndex)) {
      this.setOnStage(a, d, s);
      return;
    }
    this.setOffStage();
  }

  setOnStage(a: number, d: number, s: number) {
    const attackChangeAmount = this.attackChangeAmount(a);
    const decayChangeAmount = this.decayChangeAmount(d, s);
    if (this.stage === 'r' || this.stage === 'off') {
      this.stage = 'a';
      return;
    }
    if (this.stage === 'a' && this.value + attackChangeAmount >= 1) {
      this.stage = 'd';
      return;
    }
    if (this.stage === 'd' && this.value - decayChangeAmount <= s) {
      this.stage = 's';
      return;
    }
  }

  setOffStage() {
    this.stage = 'r';
    if (this.value <= 0) {
      this.stage = 'off';
    }
  }
}

registerProcessor('envelope-generator-processor', EnvelopeGeneratorProcessor);
