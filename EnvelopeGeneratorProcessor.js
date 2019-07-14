class EnvelopeGeneratorProcessor extends AudioWorkletProcessor {
  constructor(args) {
    super();
    const options = {
      ...args,
      a: 0.1,
      d: 0.4,
      s: 0.3,
      r: 0.6,
      cutoffVoltage: 0.8,
    };

    this.samplingFrequency = 44100;
    this.a = options.a;
    this.d = options.d;
    this.r = options.r;
    this.s = options.s;
    this.cutoffVoltage = options.cutoffVoltage;
    this.stage = 'off'; // off | a | d | s | r
    this.value = 0;
  }

  get attackSamples() {
    return this.a * this.samplingFrequency;
  }

  get attackChangeAmount() {
    return (1 / this.attackSamples);
  }

  get decaySamples() {
    return (this.d * this.samplingFrequency) / (1 - this.s);
  }

  get decayChangeAmount() {
    return (1 / this.decaySamples);
  }

  get releaseSamples() {
    return (this.r * this.samplingFrequency) / this.s;
  }

  get releaseChangeAmount() {
    return (1 / this.releaseSamples);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const outputChannel = output[0];
    const input = inputs[0];
    const inputChannel = input[0];
    for (let i = 0; i < outputChannel.length; i++) {
      outputChannel[i] = this.tick(inputChannel[i]);
    }
    return true;
  }

  tick(inputValue) {
    this.setState(inputValue);
    switch (this.stage) {
      case 'a':
        this.value += this.attackChangeAmount;
        break;
      case 'd':
        this.value -= this.decayChangeAmount;
        break;
      case 's':
        this.value = this.s;
        break;
      case 'r':
        this.value -= this.releaseChangeAmount;
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

  setState(value) {
    if (value >= this.cutoffVoltage) {
      this.setOnStage();
      return;
    }
    this.setOffStage();
  }

  setOnStage() {
    // was the stage previously off
    if (this.stage === 'r' || this.stage === 'off') {
      this.stage = 'a';
      return;
    }
    // is it time to switch to decay
    if (this.stage === 'a' && this.value + this.attackChangeAmount >= 1) {
      this.stage = 'd';
      return;
    }
    // is it time to switch to sustain
    if (this.stage === 'd' && this.value - this.decayChangeAmount <= this.s) {
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
