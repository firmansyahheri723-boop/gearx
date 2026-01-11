import LZString from 'lz-string';
import type { VehicleInputs, TorqueRpmRow, GearRatio, FinalDrive, TireCompound, TractionMode, AeroSettings } from '../types';
import { vehicleInputs } from '../stores/vehicle';
import { torqueRpmData, gearRatios, finalDrive, tireCompound, tractionMode, aeroSettings } from '../stores/vehicle';

export interface ShareSetupData {
  version: number;
  inputs: VehicleInputs;
  torqueRpmData: TorqueRpmRow[];
  gearRatios: GearRatio[];
  finalDrive: FinalDrive;
  tireCompound: TireCompound;
  tractionMode: TractionMode;
  aeroSettings: AeroSettings;
}

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
  };

  return getShareUrl(data);
}
