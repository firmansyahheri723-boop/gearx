import LZString from "lz-string";
import { aeroSettings } from "@/features/aero/store";
import { alignmentInputs } from "@/features/alignment/store";
import {
	finalDrive,
	gearRatios,
	tireCompound,
	torqueRpmData,
	tractionMode,
} from "@/features/gearbox/store";
import type { SetupData } from "@/features/setups/types";
import { vehicleInputs } from "@/features/suspension/store";

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
