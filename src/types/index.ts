export interface CellRef {
  tableId: string;
  row: number;
  col: number;
}

export interface TorqueRpmRow {
  torque: number;
  rpm: number;
}

export interface GearRatio {
  ratio: number;
  min: number;
  max: number;
}

export interface FinalDrive {
  ratio: number;
  min: number;
  max: number;
}

// Gear labels for display (1st, 2nd, etc.)
export const GEAR_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'] as const;

export interface VehicleInputs {
  carSelection: string;
  engineSelection: string;
  weight: number;
  frontWeightDistribution: number;
  frontWheelOffset: number;
  rearWheelOffset: number;
  desiredRideFrequency: number;
  desiredRollGradient: number;
  wheelDiameter: number;
  profile: number;
  tireWidth: number;
  cogHeight: number;
  acceleration0to100: number;
  maxSpeed118mRadius: number;
  drivetrain: string;
  wheelbase: number;
  frontTrackWidth: number;
  rearTrackWidth: number;
  realYEngineOffset: number;
  realZEngineOffset: number;
  // Suspension-specific inputs
  wheelWeight: number; // kg per wheel
  dampingRatio: number; // ζ (0.65+ for racecars)
  tireRate: number; // N/m - tire spring rate
  magicNumber: number; // % front/rear roll stiffness distribution
  rollCenterHeight: number; // meters - height of roll center from ground
  // Engine redline
  redlineRpm: number; // RPM limit
}

export interface SpringsStiffness {
  front: number;
  rear: number;
}

export interface DamperValues {
  front: number;
  rear: number;
}

export interface Dampers {
  bump: DamperValues;
  fastBump: DamperValues;
  rebound: DamperValues;
  fastRebound: DamperValues;
}

export interface AntiRollBars {
  farb: number;
  rarb: number;
}

export interface AccelerationMetrics {
  weightTransfer: number;
  frontWeightDistOnAccel: string;
  maxLongitudinalAccel: number;
  maxLateralAccel: number;
}

// Tire compound types with friction coefficients
export type TireCompound = 'street' | 'street+' | 'sport' | 'sport+' | 'racing' | 'racing+';

export const TIRE_FRICTION_COEFFICIENTS: Record<TireCompound, number> = {
  'street': 1.12,
  'street+': 1.16,
  'sport': 1.40,
  'sport+': 1.45,
  'racing': 1.70,
  'racing+': 1.70 * 1.08, // 1.836
};

// Speed/RPM data point for each gear
export interface SpeedRpmPoint {
  rpm: number;
  speed: number; // kph
  torque: number; // Nm at engine
  wheelTorque: number; // Nm at wheel
  hp: number;
  exceedsTraction: boolean;
}

// Gearbox calculator outputs
export interface GearboxOutputs {
  wheelCircumference: number; // inches
  wheelRadiusM: number; // meters
  effectiveRatios: number[]; // gear ratio * final drive for each gear
  peakHp: number;
  peakHpRpm: number;
  tractionLimitTorque: number; // Nm - max wheel torque before wheelspin
  speedRpmData: SpeedRpmPoint[][]; // [gearIndex][rpmIndex]
  maxSpeedPerGear: number[]; // max speed in kph for each gear at redline
}

// Car Data for CSV Import/Export
export interface CarData {
  // Car identification
  car: string;

  // Wheelbase, track width (meters)
  height: number | null;
  fAxleOffset: number | null;
  rAxleOffset: number | null;
  wheelbase: number | null;
  fTrackWidth: number | null;
  rTrackWidth: number | null;
  avTrackWidth: number | null;

  // Transmission
  gears: number | null;
  shiftTime: number | null;
  weight: number | null;

  // Body - Stock
  stockCx: number | null;
  stockSx: number | null;
  stockDrag: number | null;

  // Body - Stage 1/2
  stage12Cx: number | null;
  stage12Sx: number | null;
  stage12Drag: number | null;

  // Body - Stage 3/4
  stage34Cx: number | null;
  stage34Sx: number | null;
  stage34Drag: number | null;

  // Body - Position offsets
  bodyPosX: number | null;
  bodyPosY: number | null;
  bodyPosZ: number | null;

  // Engine
  powerHp: number | null;
  massKg: number | null;
  turboPress: number | null;
  curveFallRpm: number | null;
  revLimiter: number | null;
  inertiaRatio: number | null;

  // Engine - Position offsets
  enginePosX: number | null;
  enginePosY: number | null;
  enginePosZ: number | null;
}
