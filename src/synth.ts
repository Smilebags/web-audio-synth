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
  ] = await Promise.all([
    loadImage('/static/clipboard.jpg'),
  ]);
  // @ts-ignore
  window.clipboardImage = clipboardImage;
}

async function registerProcessors(audioContext: AudioContext) {
  await Promise.all([
    audioContext.audioWorklet.addModule('processors/EnvelopeGeneratorProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltPerOctaveProcessor.js'),
    audioContext.audioWorklet.addModule('processors/SequencerProcessor.js'),
    audioContext.audioWorklet.addModule('processors/VoltageQuantizerProcessor.js'),
    audioContext.audioWorklet.addModule('processors/NoiseProcessor.js'),
  ]);
}
