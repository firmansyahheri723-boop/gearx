import type { TorqueExtractorPoint, TorqueExtractorCalibration, ExtractedDataPoint } from '../types/extraction';

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  let s = 0;
  const v = max;

  if (diff === 0) {
    h = 0;
    s = 0;
  } else {
    s = diff / max;
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return [h, s * 255, v * 255];
}

function isCyanPixel(r: number, g: number, b: number): boolean {
  const [h, s, v] = rgbToHsv(r, g, b);
  // OpenCV uses H: 0-180 (half of 360), S: 0-255, V: 0-255
  // Python code: lower_blue = [85, 100, 150], upper_blue = [105, 255, 255]
  // Converting to 360 degree scale: 85*2 = 170, 105*2 = 210
  // This targets cyan/turquoise colors
  const hueMin = 170;
  const hueMax = 210;
  const satMin = 100;  // 100/255 = ~39% saturation minimum
  const valMin = 150;  // 150/255 = ~59% value minimum
  return h >= hueMin && h <= hueMax && s >= satMin && v >= valMin;
}

export function extractCyanPixels(imageData: ImageData, calibration: TorqueExtractorCalibration): TorqueExtractorPoint[] {
  const { width, height, data } = imageData;
  const pixels: TorqueExtractorPoint[] = [];
  const { left, right, top, bottom } = calibration;

  const xMin = Math.floor(Math.min(left, right));
  const xMax = Math.ceil(Math.max(left, right));
  const yMin = Math.floor(Math.min(top, bottom));
  const yMax = Math.ceil(Math.max(top, bottom));

  for (let y = yMin; y < yMax; y++) {
    for (let x = xMin; x < xMax; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isCyanPixel(r, g, b)) {
        pixels.push({ x, y });
      }
    }
  }

  return pixels;
}

export function clusterAndCleanPixels(pixels: TorqueExtractorPoint[]): { x: number; medianY: number }[] {
  const xToY = new Map<number, number[]>();

  for (const { x, y } of pixels) {
    const xInt = Math.round(x);
    if (!xToY.has(xInt)) {
      xToY.set(xInt, []);
    }
    xToY.get(xInt)!.push(y);
  }

  const result: { x: number; medianY: number }[] = [];
  const sortedX = Array.from(xToY.keys()).sort((a, b) => a - b);

  for (const x of sortedX) {
    const yValues = xToY.get(x)!.sort((a, b) => a - b);
    const mid = Math.floor(yValues.length / 2);
    const medianY = yValues.length % 2 === 0 ? (yValues[mid - 1] + yValues[mid]) / 2 : yValues[mid];
    result.push({ x, medianY });
  }

  return result;
}

export function samplePoints(cleanPixels: { x: number; medianY: number }[], numSamples: number): TorqueExtractorPoint[] {
  if (cleanPixels.length === 0) return [];

  const xValues = cleanPixels.map(p => p.x);
  const yValues = cleanPixels.map(p => p.medianY);

  const minX = xValues[0];
  const maxX = xValues[xValues.length - 1];

  const sampleX: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    sampleX.push(minX + (maxX - minX) * (i / (numSamples - 1)));
  }

  const sampleY = sampleX.map(x => {
    let idx = 0;
    while (idx < xValues.length - 1 && xValues[idx + 1] < x) {
      idx++;
    }
    if (idx === xValues.length - 1) return yValues[yValues.length - 1];
    const x0 = xValues[idx];
    const x1 = xValues[idx + 1];
    const y0 = yValues[idx];
    const y1 = yValues[idx + 1];
    const t = (x - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  });

  return sampleX.map((x, i) => ({ x, y: sampleY[i] }));
}

export function pixelToValues(pixel: TorqueExtractorPoint, calibration: TorqueExtractorCalibration): { rpm: number; torque: number } {
  const { left, right, top, bottom, minRpm, maxRpm, minTorque, maxTorque } = calibration;
  const xMin = Math.min(left, right);
  const xMax = Math.max(left, right);
  const yMin = Math.min(top, bottom);
  const yMax = Math.max(top, bottom);

  const xRatio = (pixel.x - xMin) / (xMax - xMin);
  const yRatio = 1 - (pixel.y - yMin) / (yMax - yMin);

  const rpm = minRpm + xRatio * (maxRpm - minRpm);
  const torque = minTorque + yRatio * (maxTorque - minTorque);

  return { rpm, torque };
}

export function valuesToPixel(rpm: number, torque: number, calibration: TorqueExtractorCalibration): TorqueExtractorPoint {
  const { left, right, top, bottom, minRpm, maxRpm, minTorque, maxTorque } = calibration;
  const xMin = Math.min(left, right);
  const xMax = Math.max(left, right);
  const yMin = Math.min(top, bottom);
  const yMax = Math.max(top, bottom);

  const xRatio = (rpm - minRpm) / (maxRpm - minRpm);
  const yRatio = (torque - minTorque) / (maxTorque - minTorque);

  const x = xMin + xRatio * (xMax - xMin);
  const y = yMin + (1 - yRatio) * (yMax - yMin);

  return { x, y };
}

export function extractTorqueCurve(imageData: ImageData, calibration: TorqueExtractorCalibration): ExtractedDataPoint[] {
  const cyanPixels = extractCyanPixels(imageData, calibration);
  const cleanedPixels = clusterAndCleanPixels(cyanPixels);
  const sampledPixels = samplePoints(cleanedPixels, 30);

  return sampledPixels.map(p => {
    const values = pixelToValues(p, calibration);
    return {
      pixelX: p.x,
      pixelY: p.y,
      rpm: values.rpm,
      torque: values.torque,
    };
  });
}
