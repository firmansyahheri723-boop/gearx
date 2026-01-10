import { createStore } from 'solid-js/store';
import type {
  VehicleInputs,
  SpringsStiffness,
  Dampers,
  AntiRollBars,
  AccelerationMetrics,
  TorqueRpmRow,
  GearRatio,
  TireCompound,
} from '../types';

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
  wheelDiameter: 20,
  profile: 40,
  tireWidth: 345,
  cogHeight: 20,
  acceleration0to100: 4.7,
  maxSpeed118mRadius: 140,
  drivetrain: 'RWD/AWD',
  wheelbase: 2.934,
  frontTrackWidth: 1.63,
  rearTrackWidth: 1.62,
  realYEngineOffset: 0.568,
  realZEngineOffset: 2.021,
  // Suspension-specific inputs
  wheelWeight: 12, // kg per wheel
  dampingRatio: 1.0, // ζ (0.65+ for racecars)
  tireRate: 343232.75, // N/m - tire spring rate
  magicNumber: 58.8, // % front/rear roll stiffness distribution
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

// Transmission - Gear Ratios with min/max bounds
export const [gearRatios, setGearRatios] = createStore<GearRatio[]>([
  { gear: 'Final drive', ratio: 3.0, min: 2.0, max: 5.0 },
  { gear: '1st', ratio: 2.76, min: 1.5, max: 4.0 },
  { gear: '2nd', ratio: 2.0, min: 1.2, max: 3.0 },
  { gear: '3rd', ratio: 1.5, min: 1.0, max: 2.5 },
  { gear: '4th', ratio: 1.15, min: 0.8, max: 2.0 },
  { gear: '5th', ratio: 1.0, min: 0.7, max: 1.5 },
  { gear: '6th', ratio: 0.9, min: 0.6, max: 1.2 },
  { gear: '7th', ratio: 0, min: 0, max: 1.0 },
  { gear: '8th', ratio: 0, min: 0, max: 0.9 },
]);

// Tire compound selection for traction calculations
export const [tireCompound, setTireCompound] = createStore<{ value: TireCompound }>({
  value: 'racing',
});
