import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js';
import type { SavedSetup, SetupFilter, SetupTag } from '../types';

const STORAGE_KEY = 'gearx-setups';
const CURRENT_VERSION = 1;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadSetups(): SavedSetup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (!Array.isArray(data)) return [];
    return data.map((setup: unknown) => validateSetup(setup as Record<string, unknown>)).filter(Boolean) as SavedSetup[];
  } catch {
    return [];
  }
}

function validateSetup(data: Record<string, unknown>): SavedSetup | null {
  if (typeof data !== 'object' || data === null) return null;
  if (typeof data.id !== 'string') return null;
  if (typeof data.name !== 'string') return null;
  if (!data.inputs) return null;
  return data as SavedSetup;
}

function saveSetups(setups: SavedSetup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
  } catch {
    console.error('Failed to save setups to localStorage');
  }
}

const [setups, internalSetSetups] = createStore<SavedSetup[]>(loadSetups());

const [filter, setFilterState] = createStore<SetupFilter>({
  search: '',
  tags: [],
  carFilter: null,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});

createEffect(() => {
  saveSetups(setups);
});

export function getSetups(): SavedSetup[] {
  return setups;
}

export function getFilteredSetups(): SavedSetup[] {
  let result = [...setups];

  if (filter.search) {
    const search = filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search) ||
        s.carName.toLowerCase().includes(search) ||
        s.notes.toLowerCase().includes(search) ||
        s.tags.some((t) => t.name.toLowerCase().includes(search))
    );
  }

  if (filter.tags.length > 0) {
    result = result.filter((s) => filter.tags.every((tagId) => s.tags.some((t) => t.id === tagId)));
  }

  if (filter.carFilter) {
    result = result.filter((s) => s.carName === filter.carFilter);
  }

  result.sort((a, b) => {
    let comparison = 0;
    if (filter.sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (filter.sortBy === 'createdAt') {
      comparison = a.createdAt - b.createdAt;
    } else {
      comparison = a.updatedAt - b.updatedAt;
    }
    return filter.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
}

export function getSetupById(id: string): SavedSetup | undefined {
  return setups.find((s) => s.id === id);
}

export function createSetup(data: Omit<SavedSetup, 'id' | 'createdAt' | 'updatedAt' | 'version'>): SavedSetup {
  const now = Date.now();
  const setup: SavedSetup = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    version: CURRENT_VERSION,
  };
  internalSetSetups([...setups, setup]);
  return setup;
}

export function updateSetup(id: string, updates: Partial<Omit<SavedSetup, 'id' | 'createdAt' | 'version'>>): boolean {
  const index = setups.findIndex((s) => s.id === id);
  if (index === -1) return false;

  internalSetSetups(index, {
    ...setups[index],
    ...updates,
    updatedAt: Date.now(),
  });
  return true;
}

export function deleteSetup(id: string): boolean {
  const index = setups.findIndex((s) => s.id === id);
  if (index === -1) return false;

  internalSetSetups(setups.filter((s) => s.id !== id));
  return true;
}

export function duplicateSetup(id: string, newName?: string): SavedSetup | null {
  const original = getSetupById(id);
  if (!original) return null;

  return createSetup({
    ...original,
    name: newName ?? `${original.name} (Copy)`,
    tags: [...original.tags],
    notes: original.notes,
  });
}

export function getAllTags(): SetupTag[] {
  const tagMap = new Map<string, SetupTag>();
  setups.forEach((setup) => {
    setup.tags.forEach((tag) => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
      }
    });
  });
  return Array.from(tagMap.values());
}

export function getAllCarNames(): string[] {
  const cars = new Set(setups.map((s) => s.carName));
  return Array.from(cars).sort();
}

export function setFilter(newFilter: Partial<SetupFilter>): void {
  setFilter(newFilter);
}

export function clearFilter(): void {
  setFilter({
    search: '',
    tags: [],
    carFilter: null,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
}

export function importSetups(jsonData: string, replace = false): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;

  try {
    const data = JSON.parse(jsonData);
    const toImport = Array.isArray(data) ? data : [data];
    const validSetups: SavedSetup[] = [];

    toImport.forEach((item, index) => {
      const setup = validateSetup(item as Record<string, unknown>);
      if (setup) {
        if (replace) {
          const existingIndex = setups.findIndex((s) => s.id === setup.id);
          if (existingIndex !== -1) {
            internalSetSetups(existingIndex, { ...setup, createdAt: setups[existingIndex].createdAt });
          } else {
            validSetups.push(setup);
          }
        } else {
          validSetups.push({
            ...setup,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        imported++;
      } else {
        errors.push(`Item ${index}: Invalid format`);
      }
    });

    if (!replace) {
      internalSetSetups([...setups, ...validSetups]);
    }
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return { success: errors.length === 0, imported, errors };
}

export function exportSetups(setupIds?: string[]): string {
  const toExport = setupIds ? setups.filter((s) => setupIds.includes(s.id)) : setups;
  return JSON.stringify(toExport, null, 2);
}

export function getSetupStats(): {
  total: number;
  totalTags: number;
  totalCars: number;
  recentlyUpdated: number;
} {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    total: setups.length,
    totalTags: getAllTags().length,
    totalCars: getAllCarNames().length,
    recentlyUpdated: setups.filter((s) => s.updatedAt > oneWeekAgo).length,
  };
}
