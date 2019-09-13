import Rack from './Rack.js';
import RackModuleFactory from './RackModuleFactory.js';
import samplePatch from './SamplePatch.js';
import { loadImage } from './util.js';

document.addEventListener('click', loadDefaultPatch, {once: true});

async function loadDefaultPatch() {
  const audioContext = new AudioContext();
  await registerProcessors(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);
  // @ts-ignore
  window.oscImage = await loadImage('https://previews.123rf.com/images/vectorstockcompany/vectorstockcompany1808/vectorstockcompany180815912/108559328-sine-wave-graphic-vector-icon-isolated-on-transparent-background-sine-wave-graphic-logo-concept.jpg');
  Rack.fromPatchString(audioContext, rackContext,rackModuleFactory, samplePatch);

  
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
  ]);
}
