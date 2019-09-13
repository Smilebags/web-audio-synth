import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class OutputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  type: string = 'Output';
  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.addPlug(this.context.destination, '', 'in');
  }

  toParams(): any {
    return {
      type: this.type,
    };
  }
}