import { createStore } from 'solid-js/store';
import type {
  VehicleInputs,
  SpringsStiffness,
  Dampers,
  AntiRollBars,
  AccelerationMetrics,
  TorqueRpmRow,
  GearRatio,
  FinalDrive,
  TireCompound,
  Drivetrain,
  TractionMode,
  AeroSettings,
  AeroOutputs,
  AlignmentInputs,
} from '../types';
import type { ShareSetupData } from '../utils/share';

// Vehicle Input Parameters
export const [vehicleInputs, setVehicleInputs] = createStore<VehicleInputs>({
  carSelection: 'Dodge Challenger SRT',
  engineSelection: 'Dodge Challenger SRT',
  weight: 1788,
  frontWeightDistribution: 56,
  frontWheelOffset: 3,
  rearWheelOffset: -3,
  desiredRideFrequency: 3,
  desiredRollGradient: 0.05,
  frontWheel: { diameter: 20, profile: 40, width: 345 },
  rearWheel: { diameter: 20, profile: 40, width: 345 },
  cogHeight: 20,
  acceleration0to100: 4.7,
  maxSpeed118mRadius: 140,
  drivetrain: 'RWD' as Drivetrain,
  wheelbase: 2.934,
  frontTrackWidth: 1.63,
  rearTrackWidth: 1.62,
  realYEngineOffset: 0.568,
  realZEngineOffset: 2.021,
  // Suspension-specific inputs
  wheelWeight: 12, // kg per wheel
  dampingRatio: 1.0, // ζ (0.65+ for racecars)
  tireRate: 343232.75, // N/m - tire spring rate (35 * 9.80665 * 1000 from Excel)
  magicNumber: 58.8, // % front/rear roll stiffness distribution
  rollCenterHeight: 0.208, // meters - height of roll center from ground (H = 0.3m to CoG in Excel means ~0.2m from ground)
  // Engine redline
  redlineRpm: 8000, // RPM limit
});

// Suspension Output - Springs
export const [springsStiffness] = createStore<SpringsStiffness>({
  front: 173.441,
  rear: 135.362,
});

// Suspension Output - Dampers
export const [dampers] = createStore<Dampers>({
  bump: { front: 12275, rear: 9580 },
  fastBump: { front: 6137, rear: 4790 },
  rebound: { front: 27618, rear: 21554 },
  fastRebound: { front: 13809, rear: 10777 },
});

// Suspension Output - Anti-roll bars
export const [antiRollBars] = createStore<AntiRollBars>({
  farb: -131,
  rarb: -91,
});

// Acceleration Metrics
export const [accelerationMetrics] = createStore<AccelerationMetrics>({
  weightTransfer: 186.52,
  frontWeightDistOnAccel: '45.57%',
  maxLongitudinalAccel: 0.6,
  maxLateralAccel: 1.3065,
});

// Transmission - Torque/RPM Data
export const [torqueRpmData, setTorqueRpmData] = createStore<TorqueRpmRow[]>([
  { torque: 411, rpm: 358 },
  { torque: 434, rpm: 626 },
  { torque: 465, rpm: 893 },
  { torque: 515, rpm: 1161 },
  { torque: 578, rpm: 1428 },
  { torque: 647, rpm: 1696 },
  { torque: 720, rpm: 1963 },
  { torque: 800, rpm: 2231 },
  { torque: 889, rpm: 2498 },
  { torque: 977, rpm: 2766 },
  { torque: 1051, rpm: 3033 },
  { torque: 1098, rpm: 3301 },
  { torque: 1126, rpm: 3568 },
  { torque: 1149, rpm: 3836 },
  { torque: 1172, rpm: 4103 },
  { torque: 1194, rpm: 4371 },
  { torque: 1215, rpm: 4638 },
  { torque: 1231, rpm: 4906 },
  { torque: 1239, rpm: 5173 },
  { torque: 1239, rpm: 5441 },
  { torque: 1221, rpm: 5708 },
  { torque: 1190, rpm: 5976 },
  { torque: 1151, rpm: 6243 },
  { torque: 1110, rpm: 6511 },
  { torque: 1069, rpm: 6778 },
  { torque: 1028, rpm: 7046 },
  { torque: 988, rpm: 7313 },
  { torque: 945, rpm: 7581 },
  { torque: 895, rpm: 7849 },
  { torque: 840, rpm: 8116 },
]);

// Transmission - Final Drive (separate from gear ratios)
export const [finalDrive, setFinalDrive] = createStore<FinalDrive>({
  ratio: 3.0,
  min: 2.0,
  max: 5.0,
});

// Transmission - Gear Ratios (8 gears, indexed 0-7 for 1st-8th)
export const [gearRatios, setGearRatios] = createStore<GearRatio[]>([
  { ratio: 2.76, min: 1.5, max: 4.0 },   // 1st
  { ratio: 2.0, min: 1.2, max: 3.0 },    // 2nd
  { ratio: 1.5, min: 1.0, max: 2.5 },    // 3rd
  { ratio: 1.15, min: 0.8, max: 2.0 },   // 4th
  { ratio: 1.0, min: 0.7, max: 1.5 },    // 5th
  { ratio: 0.9, min: 0.6, max: 1.2 },    // 6th
  { ratio: 0, min: 0, max: 1.0 },        // 7th (unused)
  { ratio: 0, min: 0, max: 0.9 },        // 8th (unused)
]);

// Tire compound selection for traction calculations
export const [tireCompound, setTireCompound] = createStore<{ value: TireCompound }>({
  value: 'racing',
});

// Traction mode selection (launch = static weight, rolling = with weight transfer)
export const [tractionMode, setTractionMode] = createStore<{ value: TractionMode }>({
  value: 'launch',
});

// Aero settings (0-10 scale for game units)
export const [aeroSettings, setAeroSettings] = createStore<AeroSettings>({
  frontAero: 10,
  rearAero: 5,
  airResistance: 0,
});

// Experimental mode toggle for advanced physics estimates
const AERO_EXPERIMENTAL_KEY = 'gearx-aero-experimental';
const loadAeroExperimental = (): boolean => {
  try {
    const stored = localStorage.getItem(AERO_EXPERIMENTAL_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
};
export const [aeroExperimentalEnabled, setAeroExperimentalEnabled] = createStore<{ value: boolean }>({
  value: loadAeroExperimental(),
});

// Persist experimental toggle
const persistAeroExperimental = (value: boolean) => {
  localStorage.setItem(AERO_EXPERIMENTAL_KEY, value.toString());
};
export const toggleAeroExperimental = (): void => {
  const newValue = !aeroExperimentalEnabled.value;
  setAeroExperimentalEnabled({ value: newValue });
  persistAeroExperimental(newValue);
};

export function applySharedSetup(data: ShareSetupData): void {
  setVehicleInputs(data.inputs);
  setTorqueRpmData(data.torqueRpmData);
  setGearRatios(data.gearRatios);
  setFinalDrive(data.finalDrive);
  setTireCompound({ value: data.tireCompound });
  setTractionMode({ value: data.tractionMode });
  if (data.aeroSettings) {
    setAeroSettings(data.aeroSettings);
  }
}

// Alignment Inputs
export const [alignmentInputs, setAlignmentInputs] = createStore<AlignmentInputs>({
  frontCamber: -3.0,
  frontCaster: 5.0,
  frontToe: 0,
  frontAckermann: 0,
  frontSteeringSensitivity: 5,
  rearCamber: -2.0,
  rearToe: 0,
  maxSteeringAngle: 45,
});

const ALIGNMENT_PRESETS: Record<string, Partial<AlignmentInputs>> = {
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

export function applyAlignmentPreset(preset: string): void {
  const presetValues = ALIGNMENT_PRESETS[preset];
  if (presetValues) {
    setAlignmentInputs(presetValues);
  }
}
