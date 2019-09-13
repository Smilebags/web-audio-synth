export default interface HeaderButton {
  render(context: CanvasRenderingContext2D): void;
  handlePress(): void;
  width: number;
}