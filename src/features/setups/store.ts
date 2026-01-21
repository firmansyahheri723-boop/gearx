import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import type {
	SavedSetup,
	SetupFilter,
	SetupTag,
} from "@/features/setups/types";
import { generateId } from "@/utils/id";

const STORAGE_KEY = "gearx_setups";

const defaultFilter: SetupFilter = {
	search: "",
	tags: [],
	carFilter: null,
	sortBy: "updatedAt",
	sortOrder: "desc",
};

const deserialize = (value: string | null) => {
	try {
		const parsed = JSON.parse(value || "{}");
		return {
			setups: (parsed?.setups || []) as SavedSetup[],
			tags: (parsed?.tags || []) as SetupTag[],
			filter: (parsed?.filter || defaultFilter) as SetupFilter,
		};
	} catch {
		return {
			setups: [],
			tags: [],
			filter: defaultFilter,
		};
	}
};

export const [setupsStore, setSetupsStore] = makePersisted(
	createStore({
		setups: [] as SavedSetup[],
		tags: [] as SetupTag[],
		filter: {
			search: "",
			tags: [] as string[],
			carFilter: null as string | null,
			sortBy: "updatedAt" as "name" | "createdAt" | "updatedAt",
			sortOrder: "desc" as "asc" | "desc",
		},
	}),
	{ name: STORAGE_KEY, deserialize },
);

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
	const newFilter: SetupFilter = {
		search: "",
		tags: [],
		carFilter: null,
		sortBy: "updatedAt",
		sortOrder: "desc",
	};
	setSetupsStore("filter", newFilter);
}

export function saveSetup(
	setup: Omit<SavedSetup, "id" | "createdAt" | "updatedAt">,
	editingId?: string,
): SavedSetup {
	const existing = editingId ? getSetupById(editingId) : null;
	let updatedSetup: SavedSetup;

	if (existing) {
		updatedSetup = {
			...existing,
			...setup,
			updatedAt: Date.now(),
		};
		setSetupsStore("setups", (s) =>
			s.map((s) => (s.id === existing.id ? updatedSetup : s)),
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

	return updatedSetup;
}

export function deleteSetup(id: string) {
	setSetupsStore("setups", (s) => s.filter((item) => item.id !== id));
}

export function duplicateSetup(
	id: string,
	newName?: string,
): SavedSetup | null {
	const original = getSetupById(id);
	if (!original) return null;

	const newSetup = saveSetup({
		...original,
		name: newName ?? `${original.name} (Copy)`,
		tags: [...original.tags],
	});
	return newSetup;
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
	return found;
}

export function addTag(name: string, color: string): SetupTag {
	const tag: SetupTag = {
		id: generateId(),
		name,
		color,
	};
	setSetupsStore("tags", (t) => [...t, tag]);
	return tag;
}

export function deleteTag(id: string) {
	setSetupsStore("tags", (t) => t.filter((tag) => tag.id !== id));
	setSetupsStore("setups", (s) =>
		s.map((setup) => ({
			...setup,
			tags: setup.tags.filter((t) => t.id !== id),
		})),
	);
}
