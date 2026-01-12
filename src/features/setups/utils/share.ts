import LZString from 'lz-string';
import type { SetupData } from '../../../types';
import { vehicleInputs, torqueRpmData, gearRatios, finalDrive, tireCompound, tractionMode } from '../../shared/store/vehicle';
import { aeroSettings } from '../../aero/store';
import { alignmentInputs } from '../../alignment/store';

export type ShareSetupData = SetupData;

export function serializeSetup(data: ShareSetupData): string {
  const json = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

export function deserializeSetup(encoded: string): ShareSetupData | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    const data = JSON.parse(decompressed) as ShareSetupData;
    if (data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function getShareUrl(data: ShareSetupData): string {
  const compressed = serializeSetup(data);
  const url = new URL(window.location.href);
  url.search = `setup=${compressed}`;
  return url.toString();
}

export function generateShareUrl(): string {
  const data: ShareSetupData = {
    version: 1,
    inputs: vehicleInputs,
    torqueRpmData,
    gearRatios,
    finalDrive,
    tireCompound: tireCompound.value,
    tractionMode: tractionMode.value,
    aeroSettings,
    alignmentInputs,
  };

  return getShareUrl(data);
}
