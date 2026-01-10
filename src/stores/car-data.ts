import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';
import type { CarData } from '../types';
import { setVehicleInputs } from './vehicle';
import { toast } from './notifications';

const STORAGE_KEY = 'gearx-car-data';
const SELECTED_CAR_KEY = 'gearx-selected-car';
const SELECTED_ENGINE_KEY = 'gearx-selected-engine';

// Load data from localStorage
const loadFromStorage = (): CarData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CarData[];
    }
  } catch {
    // Silent fail - return empty array
  }
  return [];
};

// Save data to localStorage, returns error message if failed
const saveToStorage = (data: CarData[]): string | undefined => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return undefined;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return 'Storage quota exceeded. Data imported but will not persist after refresh.';
    }
    return 'Failed to save data to browser storage. Data imported but will not persist after refresh.';
  }
};

// Remove data from localStorage
const removeFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail - not critical
  }
};

// Car data store for imported CSV data - initialized from localStorage
export const [carData, setCarData] = createStore<CarData[]>(loadFromStorage());

// Selected car and engine indices (independent selection)
const loadSelectedCar = (): number | null => {
  try {
    const stored = localStorage.getItem(SELECTED_CAR_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
};

const loadSelectedEngine = (): number | null => {
  try {
    const stored = localStorage.getItem(SELECTED_ENGINE_KEY);
    return stored ? parseInt(stored, 10) : null;
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

// Clear all car data
export const clearCarData = () => {
  setCarData([]);
  setSelectedCarIndex(null);
  setSelectedEngineIndex(null);
  removeFromStorage();
  localStorage.removeItem(SELECTED_CAR_KEY);
  localStorage.removeItem(SELECTED_ENGINE_KEY);
};

// Replace all car data (used when importing CSV)
// Returns error message if localStorage save failed, undefined on success
export const importCarData = (data: CarData[]): string | undefined => {
  setCarData(data);
  // Clear selections if they become invalid
  const carIdx = selectedCarIndex();
  const engineIdx = selectedEngineIndex();
  if (carIdx !== null && carIdx >= data.length) {
    setSelectedCarIndex(null);
    localStorage.removeItem(SELECTED_CAR_KEY);
  }
  if (engineIdx !== null && engineIdx >= data.length) {
    setSelectedEngineIndex(null);
    localStorage.removeItem(SELECTED_ENGINE_KEY);
  }
  return saveToStorage(data);
};

/**
 * Apply car data to vehicle inputs (chassis/body related fields only)
 * Missing values (null) are reset to 0 to indicate missing data
 */
export const applyCarData = (car: CarData): void => {
  // Chassis/body properties from CarData -> VehicleInputs
  // Using 0 as default for missing values to clearly indicate missing data
  
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
  // Engine-related properties
  // Note: We store power/mass for reference, but these don't directly map to current vehicleInputs
  // The main effect is updating the engine selection name
  
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
