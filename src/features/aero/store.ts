import { createStore } from "solid-js/store";
import type { AeroSettings } from "../../types";

export const [aeroSettings, setAeroSettings] = createStore<AeroSettings>({
  frontAero: 10,
  rearAero: 5,
  airResistance: 0,
});

const AERO_EXPERIMENTAL_KEY = "gearx-aero-experimental";
const loadAeroExperimental = (): boolean => {
  try {
    const stored = localStorage.getItem(AERO_EXPERIMENTAL_KEY);
    return stored === "true";
  } catch {
    return false;
  }
};
export const [aeroExperimentalEnabled, setAeroExperimentalEnabled] =
  createStore<{ value: boolean }>({
    value: loadAeroExperimental(),
  });

export const toggleAeroExperimental = (): void => {
  const newValue = !aeroExperimentalEnabled.value;
  setAeroExperimentalEnabled({ value: newValue });
  localStorage.setItem(AERO_EXPERIMENTAL_KEY, newValue.toString());
};
