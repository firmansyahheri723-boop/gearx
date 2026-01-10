import { createStore } from 'solid-js/store';
import type { CarData } from '../types';

const STORAGE_KEY = 'gearx-car-data';

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

// Clear all car data
export const clearCarData = () => {
  setCarData([]);
  removeFromStorage();
};

// Replace all car data (used when importing CSV)
// Returns error message if localStorage save failed, undefined on success
export const importCarData = (data: CarData[]): string | undefined => {
  setCarData(data);
  return saveToStorage(data);
};
