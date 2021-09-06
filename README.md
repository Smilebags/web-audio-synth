# Web Audio Modular Synth
[Live Demo](https://smilebags.github.io/web-audio-synth/dist/index.html)

This provides an in-browser modular synthesizer with support for MIDI input, audio file playback, microphone input, wave visualisation, and WAV output capability. All modules are audio-rate, so trigger or clock signals can be 'listened' to, and audio signals can be used as triggers or clocks.

It is heavily inspired by eurorack modular synthesizer components and uses the conventions found there for communication between modules.

NOTE: It only runs in Chrome and Edge currently due to [AudioWorklet API support](https://caniuse.com/#feat=mdn-api_audioworklet).

# Usage
You can scroll both vertically and horizontally to view more modules than fit on your screen.
Clicking on the buttons along the top will add a new module to the first available slot in the row closest to the top of the screen; if you scroll down, newly added modules will appear below the initial one.
## Modules
Modules are what enables the creation or processing of sound. Each module has a specific purpose and they are connected together using cables to create more elaborate sounds.
Control or Command clicking and dragging on a module will allow you to reposition it. When released it will snap to the grid
Alt or Option clicking a module will delete it.
Clicking on the title of a module will enable you to rename it. A white line will appear below the module name, and pressing enter will return to regular mode

## Cables
Cables are what is used to move signals from one module to the next.
Dragging from an output plug (white border) to an input plug (grey border) on modules will create a cable between them.
Multiple cables can be connected to the same input or output.
Clicking on either end of the cable will delete it, and if there are multiple, the most recently created cable will be deleted.

## Saving
Once you have created something you like, you can record what you are hearing through the output module by pressing the "Start" button which will make the buttons glow. Pressing save will then save the audio to a file, or discard the recording and start again.
You can also save the configuration you have created by pressing the "Save" button in the top left. You have the option to save your patch to the clipboard, or to the browser storage. You can then later load up the same patch by copying it to the clipboard or reloading the page and choosing "Load Rack" then "Browser".

# Module List
## Filter
A low-pass and high-pass filter with variable frequency and Q.
## Envelope
A module which converts an incoming trigger signal into a smooth signal with four segments: ADSR
- Attack: the time it takes for the initial rise from 0 to 1
- Decay: the time it takes for the signal to fall from 1 to the sustain level
- Sustain: the value to stay at while the input is held on
- Decay: the time it takes for the signal to decay back to 0 from the sustain level
## Step Sequencer
A simple 16-step sequencer where each step can either be on or off.
## Voltage Sequencer
A 16-step sequencer where each step corresponds to the value input in the grid of dials.
## Keyboard Input
Converts key presses on the keyboard into two signals: Gate and V/O (volts per octave). The middle row of keys from `A` to `'` correspond with one and a half octaves of white keys, starting from the note C. Where there is a black key between two white keys on a piano, the top row of keys correspond to those black keys.

`Z` and `X` will lower and increase the octave of the keyboard respectively.
## Midi Input
Converts MIDI note signals from a connected MIDI keyboard or other MIDI device to a number of outputs: V/O (as with KeyboardInput), Velocity (where supported by the device), Gate (on if any key is pressed), Trigger (on temporarily each time a key is pressed), and Pitchbend and Modwheel (where supported by the device).
## Midi CC Input
Converts MIDI CC messages from 8 consecutive CC IDs from MIDI devices sliders or dials into signals which can be plugged into modules throughout the system. This is useful for connecting MIDI keyboard hardware dials to parameters of a synthesizer created in this tool.
## Delay
Delays the input signal by the amount of seconds specified in the delay input.
## Output
Plays the sounds fed into it to the browser's output device. This is how you listen to what is being created
## Gain
Multiplies the incoming signal by the amount specified in the "VC" control.
## Oscillator
Generates a basic waveform at the specified frequency. Different basic waveforms can be selected from the buttons.
## VoltageQuantizer
Converts a smooth signal into one which has 12 steps per volt, which can help signals to sound more musical when fed into the pitch control of another module.
## Noise
Generates white noise.
## Clock Divider
Divides the incoming signal (assumed to be a square wave used as a clock signal) and outputs the slower signals on the corresponding outputs. Used to create a collection of clocks which are synchronised but not the same tempo.
## Sampler
Records the signal fed into it when the "record" control is high, and outputs the recorded signal at the chosen rate each time the play signal goes high.
## Audio Input
Enables input from microphones or other audio input devices.
## Glide
Smooths out a signal.
## Values
Outputs constant values based on the dial positions.
## Chords
Outputs 1 of 8 rows of values in each of the 4 output channels. Useful for setting up a chord progression with up to 4 notes.
## Distortion
Softly saturates the input signal.
## Amplitude
Outputs the maximum value of the input signal over a small window. Useful as an estimate of the volume of a signal.
## Viewer
Draws the input signal to the screen.
## Math
Does basic mathematical operations on the two input channels.
## Sample Loader
Enables playback of local audio files. Click the module to bring up the file select dialog.
## Reverb
Passes the input signal through one of four convolutional reverb samples.