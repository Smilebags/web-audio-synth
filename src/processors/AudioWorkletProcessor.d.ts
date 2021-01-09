interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: AudioWorkletParameters,
  ): boolean;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

declare function registerProcessor(
  name: string,
  processorCtor: (new (
    options?: AudioWorkletNodeOptions
  ) => AudioWorkletProcessor) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
): void;

declare var sampleRate: number;

type AudioWorkletParameters = Record<string, Float32Array>;
