import Plug from "../Plug.js";
import AbstractRackModule from "./AbstractRackModule.js";

export default class OutputModule extends AbstractRackModule {
  width!: number;
  context: AudioContext;
  plugs!: Plug[];
  constructor(context: AudioContext) {
    super();
    this.context = context;
    this.addPlug(this.context.destination, 'System Out', 'out');
  }
}