import Rack from './Rack.js';
import RackModuleFactory from './RackModuleFactory.js';
// import samplePatch from './SamplePatch.js';
import { loadImage } from './util.js';

const optionsEl = document.querySelector('.options')!;
optionsEl.addEventListener('click', hideOptions, {once: true});

const loadFromClipboardEl = document.querySelector('.load-from-clipboard')!;
loadFromClipboardEl.addEventListener('click', loadFromClipboard, {once: true});

const startDefaultEl = document.querySelector('.start-default')!;
startDefaultEl.addEventListener('click', () => loadPatch(), {once: true});

const startThreeVoiceSawEl = document.querySelector('.start-three-voice-saw')!;
startThreeVoiceSawEl.addEventListener('click', () => loadPatch('three-voice-saw'), {once: true});

const startMultiInstrumentEl = document.querySelector('.start-two-instruments')!;
startMultiInstrumentEl.addEventListener('click', () => loadPatch('two-instruments'), {once: true});

async function loadPatch(patchName = 'default') {
  const audioContext = new AudioContext();
  await loadDependencies(audioContext);

  const rackEl: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('.rack')!;
  const rackContext = rackEl.getContext('2d')!;
  const rackModuleFactory = new RackModuleFactory(audioContext);
  const patchString = await fetch(`/${patchName}.patch`).then(res => res.text());
  Rack.fromPatchString(audioContext, rackContext,rackModuleFactory, patchString);
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
    loadImage('static/clipboard.jpg'),
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
    audioContext.audioWorklet.addModule('processors/ClockDividerProcessor.js'),
    audioContext.audioWorklet.addModule('processors/SamplerProcessor.js'),
    audioContext.audioWorklet.addModule('processors/GlideProcessor.js'),
    audioContext.audioWorklet.addModule('processors/ChordsProcessor.js'),
    audioContext.audioWorklet.addModule('processors/MathProcessor.js'),
  ]);
}
