export function isSet(val) {
    return val !== undefined && val !== null;
}
export async function loadImage(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let status = 'loading';
        img.onload = () => {
            status = 'loaded';
            resolve(img);
        };
        setTimeout(() => {
            if (status !== 'loaded') {
                status = 'timeout';
                reject();
            }
        }, timeout);
        img.src = url;
    });
}
export function displayFreq(freq) {
    if (freq < 10) {
        return freq.toFixed(4);
    }
    if (freq < 100) {
        return freq.toFixed(3);
    }
    if (freq < 1000) {
        return freq.toFixed(2);
    }
    if (freq < 10000) {
        return `${(freq / 1000).toFixed(3)}k`;
    }
    return `${(freq / 1000).toFixed(2)}k`;
}
export function clamp(value, low = 0, high = 1) {
    return Math.max(Math.min(value, high), low);
}
export function isPromise(obj) {
    return typeof obj.then === 'function';
}
