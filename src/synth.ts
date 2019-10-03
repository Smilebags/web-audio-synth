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

  // @ts-ignore
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
    clipboardImage,
    backplateImage,
  ] = await Promise.all([
    loadImage('https://target.scene7.com/is/image/Target/GUEST_c25fb669-5872-4f7c-8631-1186a7caa07d?wid=488&hei=488&fmt=pjpeg'),
    loadImage('http://img.cadnav.com/allimg/131005/1-131005010P4147.jpg'),
 
  ]);
  // @ts-ignore
  window.clipboardImage = clipboardImage;
  // @ts-ignore
  window.backplateImage = backplateImage;
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
    audioContext.audioWorklet.addModule('processors/SequencerProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltageQuantizerProcessor.js'),
  ]);
}
