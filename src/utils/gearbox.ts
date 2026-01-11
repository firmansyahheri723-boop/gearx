import type { GearRatio, TorqueRpmRow, SpeedRpmPoint, GearboxOutputs, TireCompound, WheelData, Drivetrain, TractionMode } from '../types';
import { TIRE_FRICTION_COEFFICIENTS, AWD_TRACTION_MULTIPLIER } from '../types';
import { GRAVITY_MS2, KPH_100_IN_MS, INCHES_PER_MILE, MM_TO_INCHES, KW_TO_HP } from '../constants/physics';

type GearboxCalcInputs = {
  frontWheel: WheelData;
  rearWheel: WheelData;
  gearRatios: GearRatio[];
  finalDrive: number;
  torqueRpmData: TorqueRpmRow[];
  weight: number;
  frontWeightDistribution: number;
  cogHeight: number;
  wheelbase: number;
  drivetrain: Drivetrain;
  tireCompound: TireCompound;
  tractionMode: TractionMode;
  acceleration0to100: number;
}

function getAverageWheel(front: WheelData, rear: WheelData): WheelData {
  return {
    diameter: (front.diameter + rear.diameter) / 2,
    profile: (front.profile + rear.profile) / 2,
    width: (front.width + rear.width) / 2,
  };
}

function getWheelForTraction(drivetrain: Drivetrain, frontWheel: WheelData, rearWheel: WheelData): WheelData {
  if (drivetrain === 'FWD') return frontWheel;
  return rearWheel;
}

/**
 * Calculate wheel circumference in inches
 */
export function calcWheelCircumference(tireWidth: number, profile: number, wheelDiameter: number): number {
  const sidewallHeightMm = tireWidth * (profile / 100);
  const sidewallHeightInches = sidewallHeightMm / MM_TO_INCHES;
  const totalDiameter = wheelDiameter + 2 * sidewallHeightInches;
  return totalDiameter * Math.PI;
}

/**
 * Calculate wheel radius in meters
 */
export function calcWheelRadiusM(tireWidth: number, profile: number, wheelDiameter: number): number {
  const sidewallHeightMm = tireWidth * (profile / 100);
  const sidewallHeightInches = sidewallHeightMm / MM_TO_INCHES;
  const totalDiameterInches = wheelDiameter + 2 * sidewallHeightInches;
  return (totalDiameterInches * 2.54) / 100 / 2;
}

/**
 * Calculate speed in kph at given RPM and total drive ratio
 * Formula from Excel: RPM * 60 * Circumference / 63360 / TotalRatio * 1.60934
 */
export function calcSpeedKph(rpm: number, circumferenceInches: number, totalRatio: number): number {
  if (totalRatio === 0) return 0;
  return (rpm * 60 * circumferenceInches) / INCHES_PER_MILE / totalRatio * 1.60934;
}

/**
 * Calculate horsepower from torque and RPM
 * Formula: HP = Torque * RPM / 9549 * 1.34102
 * 9549 is the conversion factor for Nm to kW at given RPM
 * 1.34102 converts kW to HP
 */
export function calcHorsepower(torqueNm: number, rpm: number): number {
  return (torqueNm * rpm) / 9549 * KW_TO_HP;
}

/**
 * Calculate wheel torque from engine torque and gear ratios
 */
export function calcWheelTorque(engineTorqueNm: number, gearRatio: number, finalDrive: number): number {
  return engineTorqueNm * gearRatio * finalDrive;
}

/**
 * Calculate longitudinal acceleration in g
 * Formula: a = (vf - vs) / dt / g
 * For 0-100 kph: (27.78 - 0) / time / 9.81
 */
export function calcLongitudinalAccelG(acceleration0to100: number): number {
  return KPH_100_IN_MS / acceleration0to100 / GRAVITY_MS2;
}

/**
 * Calculate weight transfer under acceleration
 * Formula: (CoGHeight_m / Wheelbase) * Mass * LongAccel_g
 */
export function calcWeightTransfer(
  cogHeightM: number,
  wheelbaseM: number,
  massKg: number,
  longAccelG: number
): number {
  return (cogHeightM / wheelbaseM) * massKg * longAccelG;
}

/**
 * Calculate traction limit as wheel torque (Nm)
 * For RWD: rear weight dynamic * g * friction coefficient * wheel radius
 * For FWD: front weight dynamic * g * friction coefficient * wheel radius
 * For AWD: uses all 4 wheels with AWD_TRACTION_MULTIPLIER
 */
export function calcTractionLimitTorque(
  massKg: number,
  frontWeightDist: number,
  cogHeightM: number,
  wheelbaseM: number,
  longAccelG: number,
  frictionCoef: number,
  wheel: WheelData,
  drivetrain: Drivetrain
): number {
  const frontWeight = massKg * frontWeightDist;
  const rearWeight = massKg - frontWeight;
  const weightTransfer = calcWeightTransfer(cogHeightM, wheelbaseM, massKg, longAccelG);
  const wheelRadiusM = calcWheelRadiusM(wheel.width, wheel.profile, wheel.diameter);
  const frontWeightDynamic = frontWeight - weightTransfer;
  const rearWeightDynamic = rearWeight + weightTransfer;

  switch (drivetrain) {
    case 'AWD': {
      // AWD uses traction from both axles with weight transfer applied
      const frontTraction = frontWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
      const rearTraction = rearWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
      return (frontTraction + rearTraction) * AWD_TRACTION_MULTIPLIER;
    }
    case 'RWD': {
      return rearWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
    }
    case 'FWD':
    default: {
      return frontWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
    }
  }
}

/**
 * Main function to calculate all gearbox outputs
 */
export function calculateGearboxOutputs(inputs: GearboxCalcInputs): GearboxOutputs {
  const {
    frontWheel,
    rearWheel,
    gearRatios,
    finalDrive,
    torqueRpmData,
    weight,
    frontWeightDistribution,
    cogHeight,
    wheelbase,
    drivetrain,
    tireCompound,
    tractionMode,
    acceleration0to100,
  } = inputs;

  // Speed/RPM calculations use averaged wheel (speedometer accuracy)
  const avgWheel = getAverageWheel(frontWheel, rearWheel);
  const wheelCircumference = calcWheelCircumference(avgWheel.width, avgWheel.profile, avgWheel.diameter);

  // Traction calculations use appropriate wheel based on drivetrain
  const tractionWheel = getWheelForTraction(drivetrain, frontWheel, rearWheel);

  // gearRatios is now a clean array of just gears (no final drive mixed in)
  const gearCount = gearRatios.length;

  // Calculate effective ratios for each gear
  const effectiveRatios: number[] = [];
  for (let i = 0; i < gearCount; i++) {
    effectiveRatios.push(gearRatios[i].ratio * finalDrive);
  }

  // Find peak HP and its RPM
  let peakHp = 0;
  let peakHpRpm = 0;
  for (const row of torqueRpmData) {
    const hp = calcHorsepower(row.torque, row.rpm);
    if (hp > peakHp) {
      peakHp = hp;
      peakHpRpm = row.rpm;
    }
  }

  // Calculate traction limit
  // For launch mode, use 0 acceleration (static weight distribution)
  // For rolling mode, use actual acceleration for weight transfer
  const cogHeightM = cogHeight * 2.54 / 100;
  const longAccelG = tractionMode === 'launch' ? 0 : calcLongitudinalAccelG(acceleration0to100);
  const frictionCoef = TIRE_FRICTION_COEFFICIENTS[tireCompound];
  const tractionLimitTorque = calcTractionLimitTorque(
    weight,
    frontWeightDistribution / 100,
    cogHeightM,
    wheelbase,
    longAccelG,
    frictionCoef,
    tractionWheel,
    drivetrain
  );

  // Calculate speed/rpm data for each gear
  const speedRpmData: SpeedRpmPoint[][] = [];
  const maxSpeedPerGear: number[] = [];

  for (let gearIdx = 0; gearIdx < gearCount; gearIdx++) {
    const gearData: SpeedRpmPoint[] = [];
    const gearRatio = gearRatios[gearIdx].ratio;
    const totalRatio = effectiveRatios[gearIdx];

    // Skip if gear ratio is 0 (unused gear)
    if (gearRatio === 0) {
      speedRpmData.push([]);
      maxSpeedPerGear.push(0);
      continue;
    }

    let maxSpeed = 0;

    for (const row of torqueRpmData) {
      const speed = calcSpeedKph(row.rpm, wheelCircumference, totalRatio);
      const wheelTorque = calcWheelTorque(row.torque, gearRatio, finalDrive);
      const hp = calcHorsepower(row.torque, row.rpm);
      const exceedsTraction = wheelTorque > tractionLimitTorque;

      gearData.push({
        rpm: row.rpm,
        speed,
        torque: row.torque,
        wheelTorque,
        hp,
        exceedsTraction,
      });

      if (speed > maxSpeed) {
        maxSpeed = speed;
      }
    }

    speedRpmData.push(gearData);
    maxSpeedPerGear.push(maxSpeed);
  }

  return {
    wheelCircumference,
    wheelRadiusM: calcWheelRadiusM(tractionWheel.width, tractionWheel.profile, tractionWheel.diameter),
    effectiveRatios,
    peakHp,
    peakHpRpm,
    tractionLimitTorque,
    speedRpmData,
    maxSpeedPerGear,
  };
}
