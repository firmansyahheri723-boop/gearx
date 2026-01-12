import { createSignal } from "solid-js";
import type { CarData } from "../../types";
import { parseCSV } from "./utils/csv";
import carDataCsv from "../../assets/car-data.csv?raw";
import { setVehicleInputs } from "../shared/store/vehicle";

const SELECTED_CAR_KEY = "gearx-selected-car";
const SELECTED_ENGINE_KEY = "gearx-selected-engine";

export const carData: CarData[] = parseCSV(carDataCsv);

const loadSelectedCar = (): number | null => {
  try {
    const stored = localStorage.getItem(SELECTED_CAR_KEY);
    if (stored === null) return null;
    const idx = parseInt(stored, 10);
    return idx >= 0 && idx < carData.length ? idx : null;
  } catch {
    return null;
  }
};

const loadSelectedEngine = (): number | null => {
  try {
    const stored = localStorage.getItem(SELECTED_ENGINE_KEY);
    if (stored === null) return null;
    const idx = parseInt(stored, 10);
    return idx >= 0 && idx < carData.length ? idx : null;
  } catch {
    return null;
  }
};

export const [selectedCarIndex, setSelectedCarIndex] = createSignal<number | null>(loadSelectedCar());
export const [selectedEngineIndex, setSelectedEngineIndex] = createSignal<number | null>(loadSelectedEngine());

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
  setVehicleInputs("frontWheelOffset", car.fAxleOffset !== null ? car.fAxleOffset * 100 : 0);
  setVehicleInputs("rearWheelOffset", car.rAxleOffset !== null ? car.rAxleOffset * 100 : 0);
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
  localStorage.setItem(SELECTED_CAR_KEY, index.toString());
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
  localStorage.setItem(SELECTED_ENGINE_KEY, index.toString());
  applyEngineData(engine);
}

export function clearCarSelection(): void {
  setSelectedCarIndex(null);
  localStorage.removeItem(SELECTED_CAR_KEY);
  setVehicleInputs("carSelection", "");
}

export function clearEngineSelection(): void {
  setSelectedEngineIndex(null);
  localStorage.removeItem(SELECTED_ENGINE_KEY);
  setVehicleInputs("engineSelection", "");
}

const initCarIdx = selectedCarIndex();
if (initCarIdx !== null && initCarIdx >= 0 && initCarIdx < carData.length) {
  applyCarData(carData[initCarIdx]);
}

const initEngineIdx = selectedEngineIndex();
if (initEngineIdx !== null && initEngineIdx >= 0 && initEngineIdx < carData.length) {
  applyEngineData(carData[initEngineIdx]);
}
