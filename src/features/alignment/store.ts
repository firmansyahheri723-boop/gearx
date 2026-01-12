import { createStore } from "solid-js/store";
import type { AlignmentInputs } from "@/types";
import { ALIGNMENT_PRESETS } from "./types";

export const [alignmentInputs, setAlignmentInputs] =
  createStore<AlignmentInputs>({
    frontCamber: -3.0,
    frontCaster: 5.0,
    frontToe: 0,
    frontAckermann: 0,
    frontSteeringSensitivity: 5,
    rearCamber: -2.0,
    rearToe: 0,
    maxSteeringAngle: 45,
  });

export function applyAlignmentPreset(preset: string): void {
  const presetValues = ALIGNMENT_PRESETS[preset];
  if (presetValues) {
    setAlignmentInputs(presetValues);
  }
}
