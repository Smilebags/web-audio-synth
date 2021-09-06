export default function benchmark(name, fn) {
    console.time(name);
    fn();
    console.timeEnd(name);
}
