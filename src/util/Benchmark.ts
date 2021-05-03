export default function benchmark(name: string, fn: () => void): void {
  console.time(name);
  fn();
  console.timeEnd(name);
}