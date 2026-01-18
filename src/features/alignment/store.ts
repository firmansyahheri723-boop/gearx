import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import type { AlignmentInputs } from "@/types";
import { ALIGNMENT_PRESETS_MAP } from "./alignment-constants";

const ALIGNMENT_INPUTS_KEY = "gearx_alignment_inputs";

const defaultAlignmentInputs: AlignmentInputs = {
	frontCamber: -3.0,
	frontCaster: 5.0,
	frontToe: 0,
	frontAckermann: 5,
	frontSteeringSensitivity: 5,
	rearCamber: -2.0,
	rearToe: 0,
	maxSteeringAngle: 45,
};

const deserializeAlignmentInputs = (value: string | null): AlignmentInputs => {
	if (!value) return defaultAlignmentInputs;
	try {
		return JSON.parse(value);
	} catch {
		return defaultAlignmentInputs;
	}
};

export const [alignmentInputs, setAlignmentInputs] = makePersisted(
	createStore<AlignmentInputs>(defaultAlignmentInputs),
	{ name: ALIGNMENT_INPUTS_KEY, deserialize: deserializeAlignmentInputs },
);

export function applyAlignmentPreset(preset: string): void {
	const presetValues = ALIGNMENT_PRESETS_MAP[preset];
	if (presetValues) {
		setAlignmentInputs(presetValues);
	}
}
