export type CellRef = {
  tableId: string;
  row: number;
  col: number;
};

export type TorqueRpmRow = {
  torque: number;
  rpm: number;
};

export type GearRatio = {
  ratio: number;
  min: number;
  max: number;
};

export type FinalDrive = {
  ratio: number;
  min: number;
  max: number;
};

export const GEAR_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'] as const;

export type VehicleInputs = {
  carSelection: string;
  engineSelection: string;
  weight: number;
  frontWeightDistribution: number;
  frontWheelOffset: number;
  rearWheelOffset: number;
  desiredRideFrequency: number;
  desiredRollGradient: number;
  frontWheel: WheelData;
  rearWheel: WheelData;
  cogHeight: number;
  acceleration0to100: number;
  maxSpeed118mRadius: number;
  drivetrain: Drivetrain;
  wheelbase: number;
  frontTrackWidth: number;
  rearTrackWidth: number;
  realYEngineOffset: number;
  realZEngineOffset: number;
  wheelWeight: number;
  dampingRatio: number;
  tireRate: number;
  magicNumber: number;
  rollCenterHeight: number;
  redlineRpm: number;
};

export type SpringsStiffness = {
  front: number;
  rear: number;
};

export type DamperValues = {
  front: number;
  rear: number;
};

export type Dampers = {
  bump: DamperValues;
  fastBump: DamperValues;
  rebound: DamperValues;
  fastRebound: DamperValues;
};

export type AntiRollBars = {
  farb: number;
  rarb: number;
};

export type AccelerationMetrics = {
  weightTransfer: number;
  frontWeightDistOnAccel: string;
  maxLongitudinalAccel: number;
  maxLateralAccel: number;
};

export type TireCompound = 'street' | 'street+' | 'sport' | 'sport+' | 'racing' | 'racing+';

export type Drivetrain = 'FWD' | 'RWD' | 'AWD';

export type TractionMode = 'launch' | 'rolling';

export const AWD_TRACTION_MULTIPLIER = 1.2;

export type WheelData = {
  diameter: number;
  profile: number;
  width: number;
};

export const TIRE_FRICTION_COEFFICIENTS: Record<TireCompound, number> = {
  'street': 1.12,
  'street+': 1.16,
  'sport': 1.40,
  'sport+': 1.45,
  'racing': 1.70,
  'racing+': 1.70 * 1.08,
};

export type SpeedRpmPoint = {
  rpm: number;
  speed: number;
  torque: number;
  wheelTorque: number;
  hp: number;
  exceedsTraction: boolean;
};

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

export type CarData = {
  car: string;
  height: number | null;
  fAxleOffset: number | null;
  rAxleOffset: number | null;
  wheelbase: number | null;
  fTrackWidth: number | null;
  rTrackWidth: number | null;
  avTrackWidth: number | null;
  gears: number | null;
  shiftTime: number | null;
  weight: number | null;
  stockCx: number | null;
  stockSx: number | null;
  stockDrag: number | null;
  stage12Cx: number | null;
  stage12Sx: number | null;
  stage12Drag: number | null;
  stage34Cx: number | null;
  stage34Sx: number | null;
  stage34Drag: number | null;
  bodyPosX: number | null;
  bodyPosY: number | null;
  bodyPosZ: number | null;
  powerHp: number | null;
  massKg: number | null;
  turboPress: number | null;
  curveFallRpm: number | null;
  revLimiter: number | null;
  inertiaRatio: number | null;
  enginePosX: number | null;
  enginePosY: number | null;
  enginePosZ: number | null;
};

export type AeroSettings = {
  frontAero: number;
  rearAero: number;
  airResistance: number;
};

export type AeroStandardOutput = {
  frontDownforceRelative: number;
  rearDownforceRelative: number;
  aeroBalancePct: number;
  predictedBehavior: 'understeer' | 'neutral' | 'oversteer' | 'extreme_oversteer';
  recommendations: string[];
};

export type AeroSpeedDataPoint = {
  speed: number;
  frontDownforce: number;
  rearDownforce: number;
  totalDownforce: number;
  dragForce: number;
};

export type AeroExperimentalOutput = {
  frontDownforceN: number;
  rearDownforceN: number;
  totalDownforceN: number;
  dragForceN: number;
  powerLossKw: number;
  topSpeedReductionKmh: number;
  corneringGIncrease: number;
  effectiveLoadIncreaseKg: number;
  tractionLimitIncreasePct: number;
  speedData: AeroSpeedDataPoint[];
  maxSpeedKmh: number;
  referenceSpeedKmh: number;
};

export type AeroOutputs = AeroStandardOutput & {
  experimental: AeroExperimentalOutput & { enabled: boolean };
};

export type HelpLink = {
  label: string;
  url: string;
};

export type HelpContent = {
  description: string;
  formula?: string;
  variables?: string[];
  articles?: HelpLink[];
  videos?: HelpLink[];
};

// Chat types
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  timestamp: number;
};

// OpenRouter API types
export type OpenRouterModel = {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
};

export type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};

// Grouped provider with models
export type ChatProvider = {
  id: string;
  name: string;
  models: { id: string; name: string }[];
};

// Alignment Types
export type AlignmentPreset = 'grip' | 'drift' | 'street' | 'drag';

export type AlignmentInputs = {
  frontCamber: number;
  frontCaster: number;
  frontToe: number;
  frontAckermann: number;
  frontSteeringSensitivity: number;
  rearCamber: number;
  rearToe: number;
  maxSteeringAngle: number;
};

export type AlignmentOutputs = {
  understeerTendency: number;
  oversteerTendency: number;
  turnInResponse: 'sharp' | 'moderate' | 'slow';
  straightLineStability: number;
  frontCamberGain: number;
  rearCamberGain: number;
  contactPatchFront: number;
  contactPatchRear: number;
  innerWheelAngle: number;
  outerWheelAngle: number;
  ackermannType: 'positive' | 'parallel' | 'reverse';
  scrubRadiusEstimate: number;
  recommendations: string[];
};
