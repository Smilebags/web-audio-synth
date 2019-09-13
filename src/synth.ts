import Rack from './Rack.js';
import RackModuleFactory from './RackModuleFactory.js';
import samplePatch from './SamplePatch.js';

document.addEventListener('click', loadDefaultPatch, {once: true});

async function loadDefaultPatch() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);
  Rack.fromPatchString(audioContext, rackContext,rackModuleFactory, samplePatch);

  
  
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
  ]);
}
