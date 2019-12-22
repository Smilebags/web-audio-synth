export default JSON.stringify({
  moduleSlots: [
    {
      module: {
        type: "Output"
      },
      position: {
        x: 0,
        y: 0
      }
    },
    {
      module: {
        type: "KeyboardInput",
        isOn: true,
        octave: 0,
        gateHighVoltage: 1
      },
      position: {
        x: 100,
        y: 0
      }
    },
    {
      module: {
        type: "MidiInput",
      },
      position: {
        x: 200,
        y: 0
      }
    },
    {
      module: {
        type: "MidiCCInput"
      },
      position: {
        x: 300,
        y: 0
      }
    },
  ],
  cables: [],
});
