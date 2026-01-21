import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { AeroSettings } from "@/features/aero/types";
import { createDeserializer } from "@/utils/storage";

const AERO_SETTINGS_KEY = "gearx_aero_settings";
const AERO_EXPERIMENTAL_KEY = "gearx_aero_experimental";

const defaultAeroSettings: AeroSettings = {
	frontAero: 10,
	rearAero: 5,
	airResistance: 0,
};

const deserializeAeroSettings = createDeserializer(defaultAeroSettings);

const deserializeAeroExperimental = createDeserializer(false);

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
