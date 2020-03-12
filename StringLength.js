const samplingSize = 100;
const container = document.createElement('div');
container.style.position = 'absolute';
container.style.opacity = '0';
document.documentElement.appendChild(container);
export default (str, font = 'Arial') => {
    container.style.fontSize = `${samplingSize}px`;
    container.style.fontFamily = font;
    container.innerText = str;
    const width = container.clientWidth;
    container.innerText = '';
    return width / samplingSize;
};
