import Rack from './Rack.js';
import RackModuleFactory from './RackModuleFactory.js';
import samplePatch from './SamplePatch.js';
import { loadImage } from './util.js';

const optionsEl = document.querySelector('.options')!;
const loadFromClipboardEl = document.querySelector('.load-from-clipboard')!;
const startDefaultEl = document.querySelector('.start-default')!;
optionsEl.addEventListener('click', hideOptions, {once: true});
loadFromClipboardEl.addEventListener('click', loadFromClipboard, {once: true});
startDefaultEl.addEventListener('click', loadDefaultPatch, {once: true});

async function loadDefaultPatch() {
  const audioContext = new AudioContext();
  await loadDependencies(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);
  Rack.fromPatchString(audioContext, rackContext,rackModuleFactory, samplePatch);
}

async function loadFromClipboard() {
  const audioContext = new AudioContext();
  await loadDependencies(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);

  const patchString = await navigator.clipboard.readText();

  Rack.fromPatchString(audioContext, rackContext,rackModuleFactory, patchString);
}

function hideOptions() {
  optionsEl.classList.add('hidden');
}

async function loadDependencies(audioContext: AudioContext) {
  await Promise.all([
    registerProcessors(audioContext),
    loadImages(),
  ]);
}

async function loadImages() {
  const [
    oscImage,
    clipboardImage,
  ] = await Promise.all([
    loadImage('https://previews.123rf.com/images/vectorstockcompany/vectorstockcompany1808/vectorstockcompany180815912/108559328-sine-wave-graphic-vector-icon-isolated-on-transparent-background-sine-wave-graphic-logo-concept.jpg'),
    loadImage('https://target.scene7.com/is/image/Target/GUEST_c25fb669-5872-4f7c-8631-1186a7caa07d?wid=488&hei=488&fmt=pjpeg'),
 
  ]);
  // @ts-ignore
  window.oscImage = oscImage;
  // @ts-ignore
  window.clipboardImage = clipboardImage;
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
  ]);
}
