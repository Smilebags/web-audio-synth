import { Vec2 } from "./types/Vec2.js";

export function distance(pos1: Vec2, pos2: Vec2) {
  return (((pos2.x - pos1.x) ** 2) + ((pos2.y - pos1.y) ** 2)) ** 0.5;
}

export function subtract(pos1: Vec2, pos2: Vec2) {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y,
  };
}

export function add(pos1: Vec2, pos2: Vec2) {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y,
  };
}

export function isSet(val: any): boolean {
  return val !== undefined && val !== null;
}

export async function loadImage(url: string, timeout: number = 10000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let status = 'loading';

    img.onload = () => {
      status = 'loaded';
      resolve(img);
    }

    setTimeout(() => {
      if (status !== 'loaded') {
        status = 'timeout';
        reject();
      }
    }, timeout);

    img.src = url;
  });
}

export function displayFreq(freq: number): string {
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
    return `${(freq/1000).toFixed(3)}k`;
  }
  return `${(freq/1000).toFixed(2)}k`;
}

export function clamp(value: number, low: number = 0, high: number = 1) {
  return Math.max(Math.min(value, high), low);
}