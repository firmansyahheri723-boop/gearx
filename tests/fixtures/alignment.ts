import type { AlignmentInputs } from "@/types";
import type { AeroSettings } from "@/types";
import type { SavedSetup } from "@/types";
import type { TorqueRpmRow, GearRatio, FinalDrive } from "@/types";
import { suspensionInputs } from "./suspension";

export const gripAlignment: AlignmentInputs = {
  frontCamber: -3.5,
  frontCaster: 5.0,
  frontToe: -0.2,
  frontAckermann: 0,
  frontSteeringSensitivity: 50,
  rearCamber: -2.5,
  rearToe: -0.1,
  maxSteeringAngle: 38,
};

export const driftAlignment: AlignmentInputs = {
  frontCamber: -4.0,
  frontCaster: 6.0,
  frontToe: 0.3,
  frontAckermann: 20,
  frontSteeringSensitivity: 60,
  rearCamber: -1.5,
  rearToe: -0.5,
  maxSteeringAngle: 45,
};

export const streetAlignment: AlignmentInputs = {
  frontCamber: -1.5,
  frontCaster: 4.0,
  frontToe: 0,
  frontAckermann: 0,
  frontSteeringSensitivity: 50,
  rearCamber: -1.0,
  rearToe: 0,
  maxSteeringAngle: 35,
};

export const dragAlignment: AlignmentInputs = {
  frontCamber: -1.0,
  frontCaster: 3.0,
  frontToe: 0,
  frontAckermann: 0,
  frontSteeringSensitivity: 50,
  rearCamber: -0.5,
  rearToe: 0,
  maxSteeringAngle: 30,
};

export const aeroBalanced: AeroSettings = {
  frontAero: 5,
  rearAero: 5,
  airResistance: 3,
};

export const aeroFrontDominant: AeroSettings = {
  frontAero: 7,
  rearAero: 3,
  airResistance: 4,
};

export const aeroRearDominant: AeroSettings = {
  frontAero: 3,
  rearAero: 7,
  airResistance: 5,
};

export const aeroMaxDownforce: AeroSettings = {
  frontAero: 10,
  rearAero: 10,
  airResistance: 8,
};

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

export const finalDrive: FinalDrive = {
  ratio: 3.8,
  min: 3.5,
  max: 4.2,
};

export const createSetup = (overrides: Partial<SavedSetup> = {}): SavedSetup => ({
  id: "test-setup-1",
  name: "Test Setup",
  description: "A test setup for unit testing",
  tags: [],
  notes: "",
  carName: "Test Car",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: 1,
  inputs: {
    carSelection: "Test Car",
    engineSelection: "Test Engine",
    weight: 1200,
    frontWeightDistribution: 55,
    frontWheelOffset: 0,
    rearWheelOffset: 0,
    desiredRideFrequency: 1.5,
    desiredRollGradient: 1.2,
    frontWheel: { diameter: 19, profile: 35, width: 265 },
    rearWheel: { diameter: 20, profile: 30, width: 305 },
    cogHeight: 0.55,
    acceleration0to100: 5.5,
    maxSpeed118mRadius: 80,
    drivetrain: "RWD",
    wheelbase: 2.7,
    frontTrackWidth: 1.65,
    rearTrackWidth: 1.62,
    realYEngineOffset: 0,
    realZEngineOffset: 0,
    wheelWeight: 20,
    dampingRatio: 0.7,
    tireRate: 180,
    magicNumber: 55,
    rollCenterHeight: 0.15,
    redlineRpm: 8000,
  },
  torqueRpmData,
  gearRatios,
  finalDrive,
  tireCompound: "sport",
  tractionMode: "rolling",
  aeroSettings: {
    frontAero: 5,
    rearAero: 5,
    airResistance: 3,
  },
  alignmentInputs: {
    frontCamber: -3.5,
    frontCaster: 5.0,
    frontToe: -0.2,
    frontAckermann: 0,
    frontSteeringSensitivity: 50,
    rearCamber: -2.5,
    rearToe: -0.1,
    maxSteeringAngle: 38,
  },
  ...overrides,
});
