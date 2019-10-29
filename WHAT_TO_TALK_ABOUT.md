# Overview
## Motivation
I wanted to be able to implement ideas I had for modular systems without the expense of physical modular racks
I wanted to be able to make something like VCVRack but on the web
I wanted to learn more about the Web Audio API
## What is modular
Modular synthesis is a type of electronic music synthesis where you use modules with specialised uses to create sound.
Voltage is used to represent the sound wave as well as used to control parameters of modules such as pitch.
## Eurorack, gates, 1V/O
Eurorack is a set of standards for how modules communicate with each other. I have followed most of the conventions in eurorack so that I don't have to make all of these decisions again.

# Architecture
## Rack
The rack is the box which contains many modules patched together with cables. It is responsible for connecting cables between it's modules' plugs.
## Rack Module
A rack module is a section of a rack with a single purpose such as creating a sound wave, outputting or recording sound, or changing a sound wave.
### Output module
This module is responsible for taking a voltage and playing that sound on the system's audio output, as well as optionally recording the output
### Midi input module
This module allows the user to control voltage in the system in a familiar way such as through a MIDI instrument like a keyboard. Important outputs are V/O and gate.
### Oscillator module
This module outputs a wave such as a sine or square wave. The frequency of the wave can be controlled through the V/O plug
## Plugs and Cables
Plugs are the only way in which modules communicate with each other. Most modules have some sort of input plugs and 1 output plug. Plugs between modules are connected with cables, and the voltage will flow from the output plug to the input plug. A plug can (deviating from reality) be plugged into multiple places and have multiple inputs.
## Rendering
The Rack renders a grey box then delegates rendering of the toolbar and each rack module to its children. The children receive the rendering context and can render themselves from 0,0 (the location has been offset by the rack) then rack cables are rendered.
### Coordinate systems
I use two coordinate systems to simplify the event delegation and rendering
- Screen space
- Rack space
- Module local space
Screen space is the regular coordinates of mouse events. These are used in the system to determine what region of the rack received the event (toolbar or module area) and if it was in the rack area, it is converted to rack space (which is simply offset from screen space in x and y). Mouse events are translated to rack space to determine which module was clicked, then transformed to that module's local space. The event is then delegated to the module for handling in local space (top left corner of module is 0,0)
## Event Handling
Since the entire thing is a single canvas element, I have to handle events manually. I capture the mouse events, the rack module determines what child (if any) should handle the event, then it transforms the event to the local space of the module and delegates the processing of the event to the module. Each module could do different things with the event such as change a parameter, or add a new module to the rack.

# Usage of TS
## Interfaces
Using an interface for the various components in the system such as a rack module made it very easy to implement different modules and helped to delineate the responsibility into components.
### Rack Module
```
  render(renderContext: CanvasRenderingContext2D): void;
  onMouse*(position: Vec2): void;
  toParams(): Object; // used for serialisation for saving, same structure is used in constructor
```
## Typed Web APIs
Having the entire Web Audio API available to me fully typed sped up development and even allowed for exploring the API in a natural and immediate way.
# Technology and APIs
## Canvas
The rendering system is done with Canvas 2D Context. This gives simple rendering controls and is suitably performant for this app.
## Web Audio
'Node' based audio processing graph. Create a node and `connect` it to another, linking them together until you reach the system output which will play through the speakers. It also gives you the ability to write 'processor's which I think of like little circuitboards you build to use in 'modules' and they have direct access to the sound wave values
## Web Midi
Web Midi was used in a single rack module to allow midi signals to control voltage in the system. This makes the modular rack a playable instrument rather than just a toy.