import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { AeroSettings } from "@/types";

export const [aeroSettings, setAeroSettings] = createStore<AeroSettings>({
	frontAero: 10,
	rearAero: 5,
	airResistance: 0,
});

const AERO_EXPERIMENTAL_KEY = "gearx-aero-experimental";

const deserializeAeroExperimental = (value: string | null): boolean => {
	return value === "true";
};

export const [aeroExperimentalEnabled, setAeroExperimentalEnabled] =
	makePersisted(createSignal(false), {
		name: AERO_EXPERIMENTAL_KEY,
		deserialize: deserializeAeroExperimental,
	});

export const toggleAeroExperimental = (): void => {
	setAeroExperimentalEnabled(!aeroExperimentalEnabled());
};
