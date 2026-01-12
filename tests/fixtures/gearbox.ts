import type { TorqueRpmRow, GearRatio, WheelData } from "@/types";

export const torqueRpmData: TorqueRpmRow[] = [
  { rpm: 1000, torque: 150 },
  { rpm: 2000, torque: 200 },
  { rpm: 3000, torque: 280 },
  { rpm: 4000, torque: 350 },
  { rpm: 5000, torque: 380 },
  { rpm: 6000, torque: 360 },
  { rpm: 7000, torque: 320 },
  { rpm: 8000, torque: 280 },
];

export const gearRatios: GearRatio[] = [
  { ratio: 3.5, min: 3.2, max: 3.8 },
  { ratio: 2.1, min: 1.9, max: 2.3 },
  { ratio: 1.5, min: 1.3, max: 1.7 },
  { ratio: 1.1, min: 1.0, max: 1.2 },
  { ratio: 0.9, min: 0.8, max: 1.0 },
  { ratio: 0.75, min: 0.7, max: 0.8 },
  { ratio: 0.6, min: 0.55, max: 0.65 },
];

export const frontWheel: WheelData = {
  diameter: 19,
  profile: 35,
  width: 265,
};

export const rearWheel: WheelData = {
  diameter: 20,
  profile: 30,
  width: 305,
};

export const finalDriveRatio = 3.8;

export const baseGearboxInputs = {
  frontWheel,
  rearWheel,
  gearRatios,
  finalDrive: finalDriveRatio,
  torqueRpmData,
  weight: 1200,
  frontWeightDistribution: 55,
  cogHeight: 0.55,
  wheelbase: 2.7,
  drivetrain: "RWD" as const,
  tireCompound: "sport" as const,
  tractionMode: "rolling" as const,
  acceleration0to100: 5.5,
};

export const awdGearboxInputs = {
  ...baseGearboxInputs,
  drivetrain: "AWD" as const,
};

export const fwdGearboxInputs = {
  ...baseGearboxInputs,
  drivetrain: "FWD" as const,
};

export const launchModeGearboxInputs = {
  ...baseGearboxInputs,
  tractionMode: "launch" as const,
};
