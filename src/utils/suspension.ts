/**
 * Suspension Calculator
 * Based on formula.xlsx "Suspension calculator" sheet
 */

import {
  GRAVITY_MS2,
  KPH_100_IN_MS,
  REFERENCE_CORNER_RADIUS_M,
} from '../constants/physics';
import { calcLongitudinalAccelG } from './gearbox';

export type SuspensionInputs = {
  weight: number;
  frontWeightDistribution: number;
  wheelWeight: number;
  rideFrequency: number;
  dampingRatio: number;
  acceleration0to100: number;
  maxSpeed118mRadius: number;
  cogHeight: number;
  wheelbase: number;
  frontTrackWidth: number;
  rearTrackWidth: number;
  desiredRollGradient: number;
  magicNumber: number;
  tireRate: number;
  rollCenterHeight: number;
  aeroFrontDownforceN?: number;
  aeroRearDownforceN?: number;
};

export type SpringsOutput = {
  frontSprungMass: number;
  rearSprungMass: number;
  frontStiffness: number;
  rearStiffness: number;
};

export type DampersOutput = {
  critDampingFront: number;
  critDampingRear: number;
  dampingForceFront: number;
  dampingForceRear: number;
  bumpFront: number;
  bumpRear: number;
  fastBumpFront: number;
  fastBumpRear: number;
  reboundFront: number;
  reboundRear: number;
  fastReboundFront: number;
  fastReboundRear: number;
};

export type AntiRollBarsOutput = {
  rollCenterToCoG: number;
  desiredRollRate: number;
  totalRollRate: number;
  frontRollRate: number;
  rearRollRate: number;
  farb: number;
  rarb: number;
};

export type AccelerationOutput = {
  longitudinalAccelG: number;
  lateralAccelG: number;
  weightTransfer: number;
  frontWeightOnAccel: number;
  rearWeightOnAccel: number;
  frontBiasOnAccel: number;
  rearBiasOnAccel: number;
};

export type SuspensionOutputs = {
  springs: SpringsOutput;
  dampers: DampersOutput;
  antiRollBars: AntiRollBarsOutput;
  acceleration: AccelerationOutput;
  experimental?: {
    aeroFrontLoadKg: number;
    aeroRearLoadKg: number;
    adjustedFrontSprungMass: number;
    adjustedRearSprungMass: number;
  };
};

/**
 * Calculate sprung mass per corner (total mass minus unsprung mass from wheels)
 * Excel: A10 = A7/2 - C4 (front axle weight / 2 - wheel weight)
 * Front sprung mass per corner = (weight * frontDist% / 2) - wheelWeight
 */
function calcSprungMass(
  weight: number,
  frontWeightDist: number,
  wheelWeight: number
): { front: number; rear: number } {
  // Front/rear axle weights
  const frontAxleWeight = weight * (frontWeightDist / 100);
  const rearAxleWeight = weight * (1 - frontWeightDist / 100);

  // Sprung mass per corner (Excel formula: axle weight / 2 - wheel weight)
  const frontSprungPerCorner = frontAxleWeight / 2 - wheelWeight;
  const rearSprungPerCorner = rearAxleWeight / 2 - wheelWeight;

  return { front: frontSprungPerCorner, rear: rearSprungPerCorner };
}

/**
 * Calculate spring stiffness using ride frequency formula
 * Excel: D4 = 4 * 3.14^2 * f^2 * m / 1000 (result in kN/m)
 * K = 4 × π² × f² × m
 */
function calcSpringStiffness(sprungMassPerCorner: number, rideFrequency: number): number {
  // Returns N/m (multiply by 1000 from kN/m in Excel, but we keep as N/m)
  return 4 * Math.PI * Math.PI * rideFrequency * rideFrequency * sprungMassPerCorner;
}

/**
 * Calculate critical damping force
 * Excel: D8 = 2 * SQRT(D4 * 1000 * A10)
 * Ccrit = 2 × √(K × m)
 */
function calcCriticalDamping(stiffnessNm: number, sprungMassPerCorner: number): number {
  return 2 * Math.sqrt(stiffnessNm * sprungMassPerCorner);
}

/**
 * Calculate damping forces from critical damping and damping ratio
 * Excel formulas for damper settings:
 * - Damping force C = Ccrit × ζ
 * - Bump = C × 2/3
 * - Fast bump = C × 1/3
 * - Rebound = C × 3/2
 * - Fast rebound = C × 3/4
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
    // Bump = C × 2/3
    bumpFront: dampingForceFront * (2 / 3),
    bumpRear: dampingForceRear * (2 / 3),
    // Fast bump = C × 1/3
    fastBumpFront: dampingForceFront * (1 / 3),
    fastBumpRear: dampingForceRear * (1 / 3),
    // Rebound = C × 3/2
    reboundFront: dampingForceFront * (3 / 2),
    reboundRear: dampingForceRear * (3 / 2),
    // Fast rebound = C × 3/4
    fastReboundFront: dampingForceFront * (3 / 4),
    fastReboundRear: dampingForceRear * (3 / 4),
  };
}

/**
 * Calculate lateral acceleration in g at given speed and radius
 * Excel: B43 = (speed * 0.277778)^2 / (118 * 9.81)
 * Aa = V² / (R × g)
 * V in m/s, R in meters
 */
function calcLateralAccelG(speedKph: number, radiusM: number): number {
  const speedMs = speedKph * 0.277778;
  return (speedMs * speedMs) / (radiusM * GRAVITY_MS2);
}

/**
 * Calculate weight transfer under acceleration
 * Weight transfer = (CoG_height / wheelbase) × mass × long_accel_g
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
 * 
 * KφDES = W × H / (φ/Ay)  [W in kg, result in Nm/deg]
 * 
 * t = average track width = (front + rear) / 2
 * Kw = average wheel rate = (front + rear) / 2
 * 
 * KφA = (π/180) × (KφDES × Kt × (t²/2)) / ((Kt × (t²/2) × π/180 - KφDES) - (π × Kw × (t²/2) / 180))
 * 
 * KφFA = KφA × Nmag / 100
 * KφRA = KφA × (100 - Nmag) / 100
 * 
 * FARB = KφFA × π / (180 × t²)
 * RARB = KφRA × π / (180 × t²)
 */
function calcAntiRollBars(
  weight: number, // kg (NOT converted to N - Excel uses kg)
  rollCenterToCoG: number, // H in meters
  desiredRollGradient: number, // φ/Ay
  frontWheelRate: number, // Kw front in N/m
  rearWheelRate: number, // Kw rear in N/m
  tireRate: number, // Kt in N/m
  frontTrackWidth: number, // meters
  rearTrackWidth: number, // meters
  magicNumber: number // % for front distribution
): AntiRollBarsOutput {
  const W = weight; // Keep in kg as per Excel formula D28 = A4 * A24 / D24
  const H = rollCenterToCoG;
  const phiAy = desiredRollGradient;
  const Kt = tireRate;

  // Average track width (Excel: B25 = (B24 + C24) / 2)
  const t = (frontTrackWidth + rearTrackWidth) / 2;

  // Average wheel rate (Excel: A29 = (A28 + B28) / 2)
  const Kw = (frontWheelRate + rearWheelRate) / 2;

  // Desired roll rate (Excel: D28 = A4 * A24 / D24)
  // Note: Excel uses weight in kg, not N
  const KphiDES = (W * H) / phiAy;

  // Total roll rate calculation (Excel: A32)
  // = (3.14/180) * (D28*C28*(B25^2/2)) / (C28*(B25^2/2)*3.14/180 - D28) - (3.14*A29*B25^2/2)/180
  const piOver180 = Math.PI / 180;
  const tSquaredHalf = (t * t) / 2;

  const numerator = piOver180 * KphiDES * Kt * tSquaredHalf;
  const denom1 = Kt * tSquaredHalf * piOver180 - KphiDES;
  const subtractTerm = (Math.PI * Kw * tSquaredHalf) / 180;

  // Excel formula structure: numerator / denom1 - subtractTerm
  const KphiA = denom1 !== 0 ? (numerator / denom1) - subtractTerm : 0;

  // Front and rear roll rates (Excel: A35, B35)
  const KphiFA = KphiA * (magicNumber / 100);
  const KphiRA = KphiA * ((100 - magicNumber) / 100);

  // ARB values using average track width (Excel: A38, B38)
  // Excel: = A35 * 3.14 / (180 * B25^2)
  const tSquared = t * t;
  const farb = (KphiFA * Math.PI) / (180 * tSquared) / 1000; // Convert to kNm
  const rarb = (KphiRA * Math.PI) / (180 * tSquared) / 1000; // Convert to kNm

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
    rollCenterHeight,
    aeroFrontDownforceN = 0,
    aeroRearDownforceN = 0,
  } = inputs;

  // Calculate aero load in kg (force / gravity)
  const aeroFrontLoadKg = aeroFrontDownforceN / GRAVITY_MS2;
  const aeroRearLoadKg = aeroRearDownforceN / GRAVITY_MS2;
  const hasAero = aeroFrontDownforceN > 0 || aeroRearDownforceN > 0;

  // Calculate sprung masses per corner (Excel approach)
  let sprungMass = calcSprungMass(weight, frontWeightDistribution, wheelWeight);

  // When aero is active, adjust sprung mass to account for downforce
  // This simulates the additional load on springs from aerodynamic forces
  let adjustedFrontSprungMass = sprungMass.front;
  let adjustedRearSprungMass = sprungMass.rear;

  if (hasAero) {
    // Divide aero load by 2 for per-corner values
    adjustedFrontSprungMass = sprungMass.front + (aeroFrontLoadKg / 2);
    adjustedRearSprungMass = sprungMass.rear + (aeroRearLoadKg / 2);
  }

  // Calculate spring stiffness (N/m)
  const frontStiffness = calcSpringStiffness(adjustedFrontSprungMass, rideFrequency);
  const rearStiffness = calcSpringStiffness(adjustedRearSprungMass, rideFrequency);

  const springs: SpringsOutput = {
    frontSprungMass: adjustedFrontSprungMass,
    rearSprungMass: adjustedRearSprungMass,
    frontStiffness,
    rearStiffness,
  };

  // Calculate damping
  const critDampingFront = calcCriticalDamping(frontStiffness, adjustedFrontSprungMass);
  const critDampingRear = calcCriticalDamping(rearStiffness, adjustedRearSprungMass);
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
  // Roll center to CoG (H) = CoG height - roll center height
  const rollCenterToCoG = cogHeight - rollCenterHeight;

  // Wheel rates are spring stiffness (N/m) - matching Excel A28, B28
  const antiRollBars = calcAntiRollBars(
    weight,
    rollCenterToCoG,
    desiredRollGradient,
    frontStiffness,
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
    ...(hasAero && {
      experimental: {
        aeroFrontLoadKg: Math.round(aeroFrontLoadKg * 10) / 10,
        aeroRearLoadKg: Math.round(aeroRearLoadKg * 10) / 10,
        adjustedFrontSprungMass: Math.round(adjustedFrontSprungMass * 10) / 10,
        adjustedRearSprungMass: Math.round(adjustedRearSprungMass * 10) / 10,
      },
    }),
  };
}
