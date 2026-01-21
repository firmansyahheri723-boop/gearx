import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import carDataCsv from "@/assets/car-data.csv?raw";
import type { CarData } from "@/features/database/types";
import { setVehicleInputs } from "@/features/suspension/store";
import { parseCSV } from "./csv";

const SELECTED_CAR_KEY = "gearx_selected_car";
const SELECTED_ENGINE_KEY = "gearx_selected_engine";

export const carData: CarData[] = parseCSV(carDataCsv);

const validateCarIndex = (value: string | null): number | null => {
	if (value === null) return null;
	const parsed = parseInt(value, 10);
	if (isNaN(parsed)) return null;
	return parsed >= 0 && parsed < carData.length ? parsed : null;
};

const validateEngineIndex = (value: string | null): number | null => {
	if (value === null) return null;
	const parsed = parseInt(value, 10);
	if (isNaN(parsed)) return null;
	return parsed >= 0 && parsed < carData.length ? parsed : null;
};

export const [selectedCarIndex, setSelectedCarIndex] = makePersisted(
	createSignal<number | null>(null),
	{ name: SELECTED_CAR_KEY, deserialize: validateCarIndex },
);

export const [selectedEngineIndex, setSelectedEngineIndex] = makePersisted(
	createSignal<number | null>(null),
	{ name: SELECTED_ENGINE_KEY, deserialize: validateEngineIndex },
);

function applyCarData(car: CarData): void {
	let wheelbase = car.wheelbase ?? 0;
	if (wheelbase === 0 && car.fAxleOffset !== null && car.rAxleOffset !== null) {
		wheelbase = car.fAxleOffset + Math.abs(car.rAxleOffset);
	}

	setVehicleInputs("wheelbase", wheelbase);
	setVehicleInputs("frontTrackWidth", car.fTrackWidth ?? 0);
	setVehicleInputs("rearTrackWidth", car.rTrackWidth ?? 0);
	setVehicleInputs("realYEngineOffset", car.bodyPosY ?? 0);
	setVehicleInputs("realZEngineOffset", car.bodyPosZ ?? 0);
	setVehicleInputs(
		"frontWheelOffset",
		car.fAxleOffset !== null ? car.fAxleOffset * 100 : 0,
	);
	setVehicleInputs(
		"rearWheelOffset",
		car.rAxleOffset !== null ? car.rAxleOffset * 100 : 0,
	);
	setVehicleInputs("carSelection", car.car || "Unknown");
}

function applyEngineData(engine: CarData): void {
	setVehicleInputs("engineSelection", engine.car || "Unknown");
	if (engine.enginePosY !== null) {
		setVehicleInputs("realYEngineOffset", engine.enginePosY);
	}
	if (engine.enginePosZ !== null) {
		setVehicleInputs("realZEngineOffset", engine.enginePosZ);
	}
}

export function getSelectedCar(): CarData | null {
	const idx = selectedCarIndex();
	return idx !== null ? carData[idx] : null;
}

export function getSelectedEngine(): CarData | null {
	const idx = selectedEngineIndex();
	return idx !== null ? carData[idx] : null;
}

export function selectCar(index: number): void {
	if (index < 0 || index >= carData.length) {
		console.warn("Selection Error: Invalid car index");
		return;
	}

	const car = carData[index];
	setSelectedCarIndex(index);
	applyCarData(car);

	clearEngineSelection();
	const engineIndex = carData.findIndex((e) => e.car === car.car);
	if (engineIndex >= 0) {
		selectEngine(engineIndex);
	}
}

export function selectEngine(index: number): void {
	if (index < 0 || index >= carData.length) {
		console.warn("Selection Error: Invalid engine index");
		return;
	}

	const engine = carData[index];
	setSelectedEngineIndex(index);
	applyEngineData(engine);
}

export function clearCarSelection(): void {
	setSelectedCarIndex(null);
	setVehicleInputs("carSelection", "");
}

export function clearEngineSelection(): void {
	setSelectedEngineIndex(null);
	setVehicleInputs("engineSelection", "");
}

const initCarIdx = selectedCarIndex();
if (initCarIdx !== null && initCarIdx >= 0 && initCarIdx < carData.length) {
	applyCarData(carData[initCarIdx]);
}

const initEngineIdx = selectedEngineIndex();
if (
	initEngineIdx !== null &&
	initEngineIdx >= 0 &&
	initEngineIdx < carData.length
) {
	applyEngineData(carData[initEngineIdx]);
}
