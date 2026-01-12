import type { SuspensionInputs } from "@/features/suspension/suspension";
import type { AlignmentInputs } from "@/types";
import type { AeroSettings } from "@/types";
import type { SavedSetup } from "@/types";
import type { TorqueRpmRow, GearRatio, FinalDrive } from "@/types";

export const suspensionInputs: SuspensionInputs = {
  weight: 1200,
  frontWeightDistribution: 55,
  wheelWeight: 20,
  rideFrequency: 1.5,
  dampingRatio: 0.7,
  acceleration0to100: 5.5,
  maxSpeed118mRadius: 80,
  cogHeight: 0.55,
  wheelbase: 2.7,
  frontTrackWidth: 1.65,
  rearTrackWidth: 1.62,
  desiredRollGradient: 1.2,
  magicNumber: 55,
  tireRate: 180,
  rollCenterHeight: 0.15,
  aeroFrontDownforceN: 0,
  aeroRearDownforceN: 0,
};

export const suspensionInputsWithAero: SuspensionInputs = {
  ...suspensionInputs,
  aeroFrontDownforceN: 800,
  aeroRearDownforceN: 1200,
};

export const extremeWeightDistribution: SuspensionInputs = {
  ...suspensionInputs,
  frontWeightDistribution: 40,
};

export const highPerformanceCar: SuspensionInputs = {
  weight: 1350,
  frontWeightDistribution: 52,
  wheelWeight: 22,
  rideFrequency: 1.8,
  dampingRatio: 0.65,
  acceleration0to100: 4.2,
  maxSpeed118mRadius: 95,
  cogHeight: 0.48,
  wheelbase: 2.8,
  frontTrackWidth: 1.7,
  rearTrackWidth: 1.68,
  desiredRollGradient: 1.0,
  magicNumber: 50,
  tireRate: 200,
  rollCenterHeight: 0.12,
};
