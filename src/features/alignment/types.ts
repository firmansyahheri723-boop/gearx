import type { AlignmentInputs } from "../../types";

export type AlignmentPresetType = "grip" | "drift" | "street" | "drag";

export const ALIGNMENT_PRESETS: Record<string, Partial<AlignmentInputs>> = {
  grip: {
    frontCamber: -3.5,
    frontCaster: 6,
    frontToe: -0.3,
    frontAckermann: 20,
    rearCamber: -2.5,
    rearToe: -0.5,
  },
  drift: {
    frontCamber: -4.0,
    frontCaster: 4,
    frontToe: 0,
    frontAckermann: -10,
    rearCamber: -3.0,
    rearToe: -1.0,
  },
  street: {
    frontCamber: -1.5,
    frontCaster: 3,
    frontToe: 0,
    frontAckermann: 0,
    rearCamber: -1.5,
    rearToe: 0,
  },
  drag: {
    frontCamber: -2.0,
    frontCaster: 8,
    frontToe: 0,
    frontAckermann: 50,
    rearCamber: -1.0,
    rearToe: 0.5,
  },
};
