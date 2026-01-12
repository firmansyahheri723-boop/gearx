export type GearboxOutputs = {
  wheelCircumference: number;
  wheelRadiusM: number;
  effectiveRatios: number[];
  peakHp: number;
  peakHpRpm: number;
  tractionLimitTorque: number;
  speedRpmData: SpeedRpmPoint[][];
  maxSpeedPerGear: number[];
};

export type SpeedRpmPoint = {
  rpm: number;
  speed: number;
  torque: number;
  wheelTorque: number;
  hp: number;
  exceedsTraction: boolean;
};

export const GEAR_LABELS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
] as const;

export type TireCompound =
  | "street"
  | "street+"
  | "sport"
  | "sport+"
  | "racing"
  | "racing+";

export type TractionMode = "launch" | "rolling";

export const TIRE_FRICTION_COEFFICIENTS: Record<TireCompound, number> = {
  street: 1.12,
  "street+": 1.16,
  sport: 1.4,
  "sport+": 1.45,
  racing: 1.7,
  "racing+": 1.7 * 1.08,
};

export const AWD_TRACTION_MULTIPLIER = 1.2;
