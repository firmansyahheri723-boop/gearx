import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { AeroSettings } from "@/types";

const AERO_SETTINGS_KEY = "gearx_aero_settings";
const AERO_EXPERIMENTAL_KEY = "gearx_aero_experimental";

const defaultAeroSettings: AeroSettings = {
	frontAero: 10,
	rearAero: 5,
	airResistance: 0,
};

const deserializeAeroSettings = (value: string | null): AeroSettings => {
	if (!value) return defaultAeroSettings;
	try {
		return JSON.parse(value);
	} catch {
		return defaultAeroSettings;
	}
};

const deserializeAeroExperimental = (value: string | null): boolean => {
	return value === "true";
};

export const [aeroSettings, setAeroSettings] = makePersisted(
	createStore<AeroSettings>(defaultAeroSettings),
	{ name: AERO_SETTINGS_KEY, deserialize: deserializeAeroSettings },
);

export const [aeroExperimentalEnabled, setAeroExperimentalEnabled] =
	makePersisted(createSignal(false), {
		name: AERO_EXPERIMENTAL_KEY,
		deserialize: deserializeAeroExperimental,
	});

export const toggleAeroExperimental = (): void => {
	setAeroExperimentalEnabled(!aeroExperimentalEnabled());
};
