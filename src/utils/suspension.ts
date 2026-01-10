/**
 * Suspension Calculator
 * Based on formula.xlsx "Suspension calculator" sheet
 */

export interface SuspensionInputs {
  weight: number; // kg
  frontWeightDistribution: number; // % (e.g., 56)
  wheelWeight: number; // kg per wheel
  rideFrequency: number; // Hz (3.0 - 5.0+ for racecars)
  dampingRatio: number; // ζ (0.65+ for racecars)
  acceleration0to100: number; // seconds
  maxSpeed118mRadius: number; // kph - max speed at 118m radius corner
  cogHeight: number; // meters
  wheelbase: number; // meters
  frontTrackWidth: number; // meters
  rearTrackWidth: number; // meters
  desiredRollGradient: number; // φ/Ay (0.02 - 0.7)
  magicNumber: number; // % front/rear roll stiffness distribution (e.g., 58.8)
  tireRate: number; // N/m - tire spring rate
}

export interface SpringsOutput {
  frontSprungMass: number; // kg
  rearSprungMass: number; // kg
  frontStiffness: number; // N/m (display as kN/m by dividing by 1000)
  rearStiffness: number; // N/m
}

export interface DampersOutput {
  critDampingFront: number; // N
  critDampingRear: number; // N
  dampingForceFront: number; // N
  dampingForceRear: number; // N
  bumpFront: number;
  bumpRear: number;
  fastBumpFront: number;
  fastBumpRear: number;
  reboundFront: number;
  reboundRear: number;
  fastReboundFront: number;
  fastReboundRear: number;
}

export interface AntiRollBarsOutput {
  rollCenterToCoG: number; // H in meters
  desiredRollRate: number; // KφDES Nm/deg
  totalRollRate: number; // KφA Nm/deg
  frontRollRate: number; // KφFA Nm/deg
  rearRollRate: number; // KφRA Nm/deg
  farb: number; // kNm
  rarb: number; // kNm
}

export interface AccelerationOutput {
  longitudinalAccelG: number; // g
  lateralAccelG: number; // g
  weightTransfer: number; // kg
  frontWeightOnAccel: number; // kg
  rearWeightOnAccel: number; // kg
  frontBiasOnAccel: number; // %
  rearBiasOnAccel: number; // %
}

export interface SuspensionOutputs {
  springs: SpringsOutput;
  dampers: DampersOutput;
  antiRollBars: AntiRollBarsOutput;
  acceleration: AccelerationOutput;
}

/**
 * Calculate sprung mass (total mass minus unsprung mass from wheels)
 * Front sprung mass = (weight * frontDist%) - (wheelWeight * 2)
 */
function calcSprungMass(
  weight: number,
  frontWeightDist: number,
  wheelWeight: number
): { front: number; rear: number } {
  const frontWeight = weight * (frontWeightDist / 100);
  const rearWeight = weight * (1 - frontWeightDist / 100);

  // Subtract unsprung mass (2 wheels per axle)
  const frontSprung = frontWeight - wheelWeight * 2;
  const rearSprung = rearWeight - wheelWeight * 2;

  return { front: frontSprung, rear: rearSprung };
}

/**
 * Calculate spring stiffness using ride frequency formula
 * K = 4 * π² * f² * m
 */
function calcSpringStiffness(sprungMass: number, rideFrequency: number): number {
  return 4 * Math.PI * Math.PI * rideFrequency * rideFrequency * sprungMass;
}

/**
 * Calculate critical damping force
 * Ccrit = 2 * √(K * m)
 */
function calcCriticalDamping(stiffness: number, sprungMass: number): number {
  return 2 * Math.sqrt(stiffness * sprungMass);
}

/**
 * Calculate damping forces from critical damping and damping ratio
 */
function calcDampingForces(
  critDampingFront: number,
  critDampingRear: number,
  dampingRatio: number
): DampersOutput {
  const dampingForceFront = critDampingFront * dampingRatio;
  const dampingForceRear = critDampingRear * dampingRatio;

  return {
    critDampingFront,
    critDampingRear,
    dampingForceFront,
    dampingForceRear,
    // Bump = C * 2/3
    bumpFront: dampingForceFront * (2 / 3),
    bumpRear: dampingForceRear * (2 / 3),
    // Fast bump = C * 1/3
    fastBumpFront: dampingForceFront * (1 / 3),
    fastBumpRear: dampingForceRear * (1 / 3),
    // Rebound = C * 3/2
    reboundFront: dampingForceFront * (3 / 2),
    reboundRear: dampingForceRear * (3 / 2),
    // Fast rebound = C * 3/4
    fastReboundFront: dampingForceFront * (3 / 4),
    fastReboundRear: dampingForceRear * (3 / 4),
  };
}

/**
 * Calculate longitudinal acceleration in g
 * a = (vf - vs) / dt / g
 * For 0-100 kph: (27.78 - 0) / time / 9.81
 */
function calcLongitudinalAccelG(acceleration0to100: number): number {
  // 100 kph = 27.78 m/s
  return 27.78 / acceleration0to100 / 9.81;
}

/**
 * Calculate lateral acceleration in g at given speed and radius
 * Aa = V² / (R * g)
 * V in m/s, R in meters
 */
function calcLateralAccelG(speedKph: number, radiusM: number): number {
  const speedMs = speedKph / 3.6;
  return (speedMs * speedMs) / (radiusM * 9.81);
}

/**
 * Calculate weight transfer under acceleration
 * Weight transfer = (CoG_height / wheelbase) * mass * long_accel_g * g
 */
function calcWeightTransfer(
  cogHeightM: number,
  wheelbaseM: number,
  massKg: number,
  longAccelG: number
): number {
  return (cogHeightM / wheelbaseM) * massKg * longAccelG;
}

/**
 * Calculate anti-roll bar stiffness
 * Based on Excel formulas:
 * KφDES = W * H / (φ/Ay)
 * KφA = π/180 * (KφDES * Kt * (t²/2)) / ((Kt * (t²/2) * π/180 - KφDES) - (π * Kw * (t²/2) / 180))
 * KφFA = KφA * Nmag / 100
 * KφRA = KφA * (100 - Nmag) / 100
 * FARB = KφFA * π / (180 * t²)
 * RARB = KφRA * π / (180 * t²)
 */
function calcAntiRollBars(
  weight: number, // kg
  rollCenterToCoG: number, // H in meters
  desiredRollGradient: number, // φ/Ay
  frontWheelRate: number, // Kw front in N/m
  rearWheelRate: number, // Kw rear in N/m
  tireRate: number, // Kt in N/m
  frontTrackWidth: number, // meters
  rearTrackWidth: number, // meters
  magicNumber: number // % for front distribution
): AntiRollBarsOutput {
  const W = weight * 9.81; // Convert to N
  const H = rollCenterToCoG;
  const phiAy = desiredRollGradient;
  const Kt = tireRate;
  const t = (frontTrackWidth + rearTrackWidth) / 2; // average track width
  const Kw = (frontWheelRate + rearWheelRate) / 2;

  // Desired roll rate (Nm/deg)
  const KphiDES = (W * H) / phiAy;

  // Total roll rate calculation using the complex formula from Excel
  // KφA = π/180 * (KφDES * Kt * (t²/2)) / ((Kt * (t²/2) * π/180 - KφDES) - (π * Kw * (t²/2) / 180))
  const piOver180 = Math.PI / 180;
  const tSquaredHalf = (t * t) / 2;

  const numerator = piOver180 * KphiDES * Kt * tSquaredHalf;
  const denomPart1 = Kt * tSquaredHalf * piOver180 - KphiDES;
  const denomPart2 = piOver180 * Kw * tSquaredHalf;
  const denominator = denomPart1 - denomPart2;

  const KphiA = denominator !== 0 ? numerator / denominator : 0;

  // Front and rear roll rates
  const KphiFA = KphiA * (magicNumber / 100);
  const KphiRA = KphiA * ((100 - magicNumber) / 100);

  // ARB values (convert to kNm by dividing by 1000)
  const farb = (KphiFA * Math.PI) / (180 * frontTrackWidth * frontTrackWidth) / 1000;
  const rarb = (KphiRA * Math.PI) / (180 * rearTrackWidth * rearTrackWidth) / 1000;

  return {
    rollCenterToCoG: H,
    desiredRollRate: KphiDES,
    totalRollRate: KphiA,
    frontRollRate: KphiFA,
    rearRollRate: KphiRA,
    farb,
    rarb,
  };
}

/**
 * Main function to calculate all suspension outputs
 */
export function calculateSuspensionOutputs(inputs: SuspensionInputs): SuspensionOutputs {
  const {
    weight,
    frontWeightDistribution,
    wheelWeight,
    rideFrequency,
    dampingRatio,
    acceleration0to100,
    maxSpeed118mRadius,
    cogHeight,
    wheelbase,
    frontTrackWidth,
    rearTrackWidth,
    desiredRollGradient,
    magicNumber,
    tireRate,
  } = inputs;

  // Calculate sprung masses
  const sprungMass = calcSprungMass(weight, frontWeightDistribution, wheelWeight);

  // Calculate spring stiffness
  const frontStiffness = calcSpringStiffness(sprungMass.front, rideFrequency);
  const rearStiffness = calcSpringStiffness(sprungMass.rear, rideFrequency);

  const springs: SpringsOutput = {
    frontSprungMass: sprungMass.front,
    rearSprungMass: sprungMass.rear,
    frontStiffness,
    rearStiffness,
  };

  // Calculate damping
  const critDampingFront = calcCriticalDamping(frontStiffness, sprungMass.front);
  const critDampingRear = calcCriticalDamping(rearStiffness, sprungMass.rear);
  const dampers = calcDampingForces(critDampingFront, critDampingRear, dampingRatio);

  // Calculate acceleration metrics
  const longitudinalAccelG = calcLongitudinalAccelG(acceleration0to100);
  const lateralAccelG = calcLateralAccelG(maxSpeed118mRadius, 118);
  const weightTransfer = calcWeightTransfer(cogHeight, wheelbase, weight, longitudinalAccelG);

  const frontWeightStatic = weight * (frontWeightDistribution / 100);
  const rearWeightStatic = weight * (1 - frontWeightDistribution / 100);

  // Under acceleration, weight transfers to rear (for RWD analysis)
  const frontWeightOnAccel = frontWeightStatic - weightTransfer;
  const rearWeightOnAccel = rearWeightStatic + weightTransfer;

  const acceleration: AccelerationOutput = {
    longitudinalAccelG,
    lateralAccelG,
    weightTransfer,
    frontWeightOnAccel,
    rearWeightOnAccel,
    frontBiasOnAccel: (frontWeightOnAccel / weight) * 100,
    rearBiasOnAccel: (rearWeightOnAccel / weight) * 100,
  };

  // Calculate anti-roll bars
  // Roll center to CoG is approximately CoG height * 0.6 (simplified assumption)
  // In the Excel, H = 0.3m for a CoG of 0.508m (20 inches)
  const rollCenterToCoG = cogHeight * 0.59; // Approximation based on Excel data

  const antiRollBars = calcAntiRollBars(
    weight,
    rollCenterToCoG,
    desiredRollGradient,
    frontStiffness, // Using spring stiffness as wheel rate approximation
    rearStiffness,
    tireRate,
    frontTrackWidth,
    rearTrackWidth,
    magicNumber
  );

  return {
    springs,
    dampers,
    antiRollBars,
    acceleration,
  };
}
