import Rack from './Rack.js';

document.addEventListener('click', init, {once: true});

async function init() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  new Rack(audioContext, rackContext);
  
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('VoltPerOctaveProcessor.js'),
  ]);
}