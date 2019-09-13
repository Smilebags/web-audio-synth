import Rack from './Rack.js';
import RackModuleFactory from './RackModuleFactory.js';

document.addEventListener('click', init, {once: true});

async function init() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);
  new Rack(audioContext, rackContext, rackModuleFactory);
  
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
  ]);
}