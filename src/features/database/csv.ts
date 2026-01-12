import Papa from "papaparse";
import type { CarData } from "@/types";
import { CSV_COLUMNS, HEADER_MAP } from "./database-constants";

function normalizeHeader(header: string): string {
	return header.toLowerCase().trim().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

export function createEmptyCarData(): CarData {
	return {
		car: "",
		height: null,
		fAxleOffset: null,
		rAxleOffset: null,
		wheelbase: null,
		fTrackWidth: null,
		rTrackWidth: null,
		avTrackWidth: null,
		gears: null,
		shiftTime: null,
		weight: null,
		stockCx: null,
		stockSx: null,
		stockDrag: null,
		stage12Cx: null,
		stage12Sx: null,
		stage12Drag: null,
		stage34Cx: null,
		stage34Sx: null,
		stage34Drag: null,
		bodyPosX: null,
		bodyPosY: null,
		bodyPosZ: null,
		powerHp: null,
		massKg: null,
		turboPress: null,
		curveFallRpm: null,
		revLimiter: null,
		inertiaRatio: null,
		enginePosX: null,
		enginePosY: null,
		enginePosZ: null,
	};
}

export function parseCSV(csvText: string): CarData[] {
	const result = Papa.parse<Record<string, string>>(csvText, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => normalizeHeader(header),
	});

	if (result.errors.length > 0) {
		console.warn("CSV parsing warnings:", result.errors);
	}

	const data: CarData[] = [];

	for (const row of result.data) {
		const carData = createEmptyCarData();
		let hasCarName = false;

		for (const [header, value] of Object.entries(row)) {
			const field = HEADER_MAP[header];
			if (!field) continue;

			if (field === "car") {
				carData.car = value?.trim() || "";
				hasCarName = !!carData.car;
			} else {
				const trimmed = value?.trim() || "";
				if (trimmed === "" || trimmed.toLowerCase() === "na") {
					(carData[field] as number | null) = null;
				} else {
					const num = parseFloat(trimmed);
					(carData[field] as number | null) = isNaN(num) ? null : num;
				}
			}
		}

		if (hasCarName) {
			data.push(carData);
		}
	}

	return data;
}
