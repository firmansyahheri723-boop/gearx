import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import type { SavedSetup, SetupTag, SetupFilter, SetupDiff } from "@/types";

const STORAGE_KEY = "gearx_setups";
const TAGS_STORAGE_KEY = "gearx_setup_tags";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const [setupsStore, setSetupsStore] = createStore({
  setups: [] as SavedSetup[],
  tags: [] as SetupTag[],
  filter: {
    search: "",
    tags: [] as string[],
    carFilter: null as string | null,
    sortBy: "updatedAt" as "name" | "createdAt" | "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
  },
});

export const [editingSetup, setEditingSetup] = createSignal<SavedSetup | null>(
  null,
);

const [persistedSetups, setPersistedSetups] = makePersisted(
  createSignal<SavedSetup[]>([]),
  { name: STORAGE_KEY },
);

const [persistedTags, setPersistedTags] = makePersisted(
  createSignal<SetupTag[]>([]),
  { name: TAGS_STORAGE_KEY },
);

export function initializeSetupsStore(): void {
  const loadedSetups = persistedSetups();
  const loadedTags = persistedTags();
  if (loadedSetups.length > 0 || loadedTags.length > 0) {
    setSetupsStore({
      setups: loadedSetups,
      tags: loadedTags,
    });
  }
}

export function getSetups(): SavedSetup[] {
  return setupsStore.setups;
}

export function getSetupById(id: string): SavedSetup | undefined {
  return setupsStore.setups.find((s) => s.id === id);
}

export function getFilteredSetups(): SavedSetup[] {
  let result = [...setupsStore.setups];

  if (setupsStore.filter.search) {
    const search = setupsStore.filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.carName.toLowerCase().includes(search) ||
        s.notes?.toLowerCase().includes(search),
    );
  }

  if (setupsStore.filter.tags.length > 0) {
    result = result.filter((s) =>
      setupsStore.filter.tags.every((tagId) =>
        s.tags.some((tag) => tag.id === tagId),
      ),
    );
  }

  if (setupsStore.filter.carFilter) {
    result = result.filter((s) => s.carName === setupsStore.filter.carFilter);
  }

  result.sort((a, b) => {
    const field = setupsStore.filter.sortBy;
    const order = setupsStore.filter.sortOrder === "asc" ? 1 : -1;
    if (field === "name") {
      return a.name.localeCompare(b.name) * order;
    }
    return (
      (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * order
    );
  });

  return result;
}

export function getAllTags(): SetupTag[] {
  return setupsStore.tags;
}

export function getAllCarNames(): string[] {
  const cars = new Set(setupsStore.setups.map((s) => s.carName));
  return Array.from(cars).sort();
}

export function setFilter(newFilter: Partial<SetupFilter>) {
  setSetupsStore("filter", (f) => ({ ...f, ...newFilter }));
}

export function clearFilter() {
  setSetupsStore("filter", {
    search: "",
    tags: [],
    carFilter: null,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
}

export function saveSetup(
  setup: Omit<SavedSetup, "id" | "createdAt" | "updatedAt">,
) {
  const existing = editingSetup();
  let updatedSetup: SavedSetup;

  if (existing) {
    updatedSetup = {
      ...existing,
      ...setup,
      updatedAt: Date.now(),
    };
    setSetupsStore("setups", (s) =>
      s.map((setup) => (setup.id === existing.id ? updatedSetup : setup)),
    );
  } else {
    updatedSetup = {
      ...setup,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSetupsStore("setups", (s) => [...s, updatedSetup]);
  }

  setPersistedSetups(setupsStore.setups);
  setEditingSetup(null);
  return updatedSetup;
}

export function deleteSetup(id: string) {
  setSetupsStore("setups", (s) => s.filter((item) => item.id !== id));
  setPersistedSetups(setupsStore.setups);
}

export function duplicateSetup(
  id: string,
  newName?: string,
): SavedSetup | null {
  const original = getSetupById(id);
  if (!original) return null;

  return createSetup({
    ...original,
    name: newName ?? `${original.name} (Copy)`,
    tags: [...original.tags],
  });
}

export function createSetup(
  data: Omit<SavedSetup, "id" | "createdAt" | "updatedAt">,
): SavedSetup {
  const now = Date.now();
  const setup: SavedSetup = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
  setSetupsStore("setups", (s) => [...s, setup]);
  setPersistedSetups(setupsStore.setups);
  return setup;
}

export function updateSetup(
  id: string,
  updates: Partial<Omit<SavedSetup, "id" | "createdAt">>,
): boolean {
  let found = false;
  setSetupsStore("setups", (s) =>
    s.map((setup) => {
      if (setup.id === id) {
        found = true;
        return { ...setup, ...updates, updatedAt: Date.now() };
      }
      return setup;
    }),
  );
  if (found) {
    setPersistedSetups(setupsStore.setups);
  }
  return found;
}

export function addTag(name: string, color: string): SetupTag {
  const tag: SetupTag = {
    id: generateId(),
    name,
    color,
  };
  setSetupsStore("tags", (t) => [...t, tag]);
  setPersistedTags(setupsStore.tags);
  return tag;
}

export function deleteTag(id: string) {
  setSetupsStore("tags", (t) => t.filter((tag) => tag.id !== id));
  setSetupsStore("setups", (s) =>
    s.map((setup) => ({
      ...setup,
      tagIds: setup.tags.filter((t) => t.id !== id),
    })),
  );
  setPersistedTags(setupsStore.tags);
  setPersistedSetups(setupsStore.setups);
}

export function compareTwoSetups(a: SavedSetup, b: SavedSetup): SetupDiff {
  const categories = [
    {
      name: "Vehicle",
      fields: ["carName", "weight", "frontWeightDistribution"],
    },
    {
      name: "Suspension",
      fields: [
        "frontSuspension",
        "rearSuspension",
        "frontRideHeight",
        "rearRideHeight",
        "frontCamber",
        "rearCamber",
        "frontToe",
        "rearToe",
        "frontCaster",
        "rearCaster",
        "frontSpringRate",
        "rearSpringRate",
        "frontPreload",
        "rearPreload",
        "frontBumpStopRate",
        "rearBumpStopRate",
        "frontBumpStopRange",
        "rearBumpStopRange",
        "frontReboundStopRange",
        "rearReboundStopRange",
      ],
    },
    {
      name: "Alignment",
      fields: [
        "frontCamberRange",
        "rearCamberRange",
        "frontToeRange",
        "rearToeRange",
        "frontCaster",
        "rearCaster",
        "frontCasterRange",
        "rearCasterRange",
      ],
    },
    { name: "Aero", fields: ["frontDownforce", "rearDownforce", "brakeBias"] },
    {
      name: "Transmission",
      fields: ["gearRatios", "finalDrive", "torqueRpmData"],
    },
  ];

  const diff: SetupDiff = {
    setupAId: a.id,
    setupBId: b.id,
    summary: { totalDiffs: 0, highImpact: 0, mediumImpact: 0, lowImpact: 0 },
    categories: categories.map((cat) => ({
      ...cat,
      fields: cat.fields
        .filter((field) => {
          const valA = (a as Record<string, unknown>)[field];
          const valB = (b as Record<string, unknown>)[field];
          if (typeof valA === "object" && typeof valB === "object") {
            return JSON.stringify(valA) !== JSON.stringify(valB);
          }
          return valA !== valB;
        })
        .map((field) => {
          const valA = (a as Record<string, unknown>)[field];
          const valB = (b as Record<string, unknown>)[field];
          return { path: field, valueA: valA, valueB: valB };
        }),
    })),
  };

  const impactFields = [
    "weight",
    "frontWeightDistribution",
    "frontSuspension",
    "rearSuspension",
    "gearRatios",
    "finalDrive",
    "torqueRpmData",
  ];

  diff.categories.forEach((cat) => {
    cat.fields.forEach((field) => {
      diff.summary.totalDiffs++;
      if (impactFields.includes(field.path)) {
        diff.summary.highImpact++;
      } else if (cat.name === "Aero" || cat.name === "Transmission") {
        diff.summary.mediumImpact++;
      } else {
        diff.summary.lowImpact++;
      }
    });
  });

  return diff;
}
