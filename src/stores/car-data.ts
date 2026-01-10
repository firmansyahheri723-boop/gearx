import { createSignal } from 'solid-js';
import type { CarData } from '../types';
import { parseCSV } from '../utils/csv';
import { setVehicleInputs } from './vehicle';
import { toast } from './notifications';
import carDataCsv from '../assets/car-data.csv?raw';

const SELECTED_CAR_KEY = 'gearx-selected-car';
const SELECTED_ENGINE_KEY = 'gearx-selected-engine';

// Parse CSV at module load - static embedded data
export const carData: CarData[] = parseCSV(carDataCsv);

// Selected car and engine indices (persisted in localStorage)
const loadSelectedCar = (): number | null => {
  try {
    const stored = localStorage.getItem(SELECTED_CAR_KEY);
    if (stored === null) return null;
    const idx = parseInt(stored, 10);
    // Validate index is within bounds
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
    // Validate index is within bounds
    return idx >= 0 && idx < carData.length ? idx : null;
  } catch {
    return null;
  }
};

export const [selectedCarIndex, setSelectedCarIndex] = createSignal<number | null>(loadSelectedCar());
export const [selectedEngineIndex, setSelectedEngineIndex] = createSignal<number | null>(loadSelectedEngine());

// Get selected car/engine data
export const getSelectedCar = (): CarData | null => {
  const idx = selectedCarIndex();
  return idx !== null && idx >= 0 && idx < carData.length ? carData[idx] : null;
};

export const getSelectedEngine = (): CarData | null => {
  const idx = selectedEngineIndex();
  return idx !== null && idx >= 0 && idx < carData.length ? carData[idx] : null;
};

/**
 * Apply car data to vehicle inputs (chassis/body related fields only)
 * Missing values (null) are reset to 0 to indicate missing data
 */
export const applyCarData = (car: CarData): void => {
  // Calculate wheelbase from axle offsets if available, otherwise use direct wheelbase
  let wheelbase = car.wheelbase ?? 0;
  if (wheelbase === 0 && car.fAxleOffset !== null && car.rAxleOffset !== null) {
    wheelbase = car.fAxleOffset + Math.abs(car.rAxleOffset);
  }
  
  setVehicleInputs('wheelbase', wheelbase);
  setVehicleInputs('frontTrackWidth', car.fTrackWidth ?? 0);
  setVehicleInputs('rearTrackWidth', car.rTrackWidth ?? 0);
  
  // Body position offsets
  setVehicleInputs('realYEngineOffset', car.bodyPosY ?? 0);
  setVehicleInputs('realZEngineOffset', car.bodyPosZ ?? 0);
  
  // Front/rear wheel offsets from axle offsets (convert to cm)
  setVehicleInputs('frontWheelOffset', car.fAxleOffset !== null ? car.fAxleOffset * 100 : 0);
  setVehicleInputs('rearWheelOffset', car.rAxleOffset !== null ? car.rAxleOffset * 100 : 0);
  
  // Update car selection name
  setVehicleInputs('carSelection', car.car || 'Unknown');
};

/**
 * Apply engine data to vehicle inputs (engine/power related fields only)
 * Missing values (null) are reset to 0 to indicate missing data
 */
export const applyEngineData = (engine: CarData): void => {
  setVehicleInputs('engineSelection', engine.car || 'Unknown');
  
  // Engine position offsets (these override car body offsets for engine placement)
  if (engine.enginePosY !== null) {
    setVehicleInputs('realYEngineOffset', engine.enginePosY);
  }
  if (engine.enginePosZ !== null) {
    setVehicleInputs('realZEngineOffset', engine.enginePosZ);
  }
};

/**
 * Select a car from the data list and apply its chassis data
 */
export const selectCar = (index: number): void => {
  if (index < 0 || index >= carData.length) {
    toast.error('Selection Error', 'Invalid car index');
    return;
  }
  
  const car = carData[index];
  setSelectedCarIndex(index);
  localStorage.setItem(SELECTED_CAR_KEY, index.toString());
  applyCarData(car);
  
  // Show warning for missing critical values
  const missingFields: string[] = [];
  if (car.wheelbase === null && (car.fAxleOffset === null || car.rAxleOffset === null)) {
    missingFields.push('wheelbase');
  }
  if (car.fTrackWidth === null) missingFields.push('front track width');
  if (car.rTrackWidth === null) missingFields.push('rear track width');
  
  if (missingFields.length > 0) {
    toast.warning(
      'Missing Data',
      `${car.car} is missing: ${missingFields.join(', ')}. Values set to 0.`
    );
  } else {
    toast.success('Car Applied', `Using ${car.car} chassis data`);
  }
};

/**
 * Select an engine from the data list and apply its engine data
 */
export const selectEngine = (index: number): void => {
  if (index < 0 || index >= carData.length) {
    toast.error('Selection Error', 'Invalid engine index');
    return;
  }
  
  const engine = carData[index];
  setSelectedEngineIndex(index);
  localStorage.setItem(SELECTED_ENGINE_KEY, index.toString());
  applyEngineData(engine);
  
  toast.success('Engine Applied', `Using ${engine.car} engine data`);
};

/**
 * Clear car selection
 */
export const clearCarSelection = (): void => {
  setSelectedCarIndex(null);
  localStorage.removeItem(SELECTED_CAR_KEY);
  setVehicleInputs('carSelection', '');
};

/**
 * Clear engine selection
 */
export const clearEngineSelection = (): void => {
  setSelectedEngineIndex(null);
  localStorage.removeItem(SELECTED_ENGINE_KEY);
  setVehicleInputs('engineSelection', '');
};
