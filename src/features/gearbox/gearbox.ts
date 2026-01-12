import {
	GRAVITY_MS2,
	INCHES_PER_MILE,
	KPH_100_IN_MS,
	KW_TO_HP,
	MM_TO_INCHES,
} from "@/constants/physics";
import type {
	Drivetrain,
	GearboxOutputs,
	GearRatio,
	SpeedRpmPoint,
	TorqueRpmRow,
	TractionMode,
	WheelData,
} from "@/types";
import {
	AWD_TRACTION_MULTIPLIER,
	TIRE_FRICTION_COEFFICIENTS as LOCAL_FRICTION_COEFFICIENTS,
} from "./gearbox-constants";

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
	tireCompound: string;
	tractionMode: TractionMode;
	acceleration0to100: number;
	aeroTractionMultiplier?: number;
};

function getAverageWheel(front: WheelData, rear: WheelData): WheelData {
	return {
		diameter: (front.diameter + rear.diameter) / 2,
		profile: (front.profile + rear.profile) / 2,
		width: (front.width + rear.width) / 2,
	};
}

function getWheelForTraction(
	drivetrain: Drivetrain,
	frontWheel: WheelData,
	rearWheel: WheelData,
): WheelData {
	if (drivetrain === "FWD") return frontWheel;
	return rearWheel;
}

export function calcWheelCircumference(
	tireWidth: number,
	profile: number,
	wheelDiameter: number,
): number {
	const sidewallHeightMm = tireWidth * (profile / 100);
	const sidewallHeightInches = sidewallHeightMm / MM_TO_INCHES;
	const totalDiameter = wheelDiameter + 2 * sidewallHeightInches;
	return totalDiameter * Math.PI;
}

export function calcWheelRadiusM(
	tireWidth: number,
	profile: number,
	wheelDiameter: number,
): number {
	const sidewallHeightMm = tireWidth * (profile / 100);
	const sidewallHeightInches = sidewallHeightMm / MM_TO_INCHES;
	const totalDiameterInches = wheelDiameter + 2 * sidewallHeightInches;
	return (totalDiameterInches * 2.54) / 100 / 2;
}

export function calcSpeedKph(
	rpm: number,
	circumferenceInches: number,
	totalRatio: number,
): number {
	if (totalRatio === 0) return 0;
	return (
		((rpm * 60 * circumferenceInches) / INCHES_PER_MILE / totalRatio) * 1.60934
	);
}

export function calcHorsepower(torqueNm: number, rpm: number): number {
	return ((torqueNm * rpm) / 9549) * KW_TO_HP;
}

export function calcWheelTorque(
	engineTorqueNm: number,
	gearRatio: number,
	finalDrive: number,
): number {
	return engineTorqueNm * gearRatio * finalDrive;
}

export function calcLongitudinalAccelG(acceleration0to100: number): number {
	return KPH_100_IN_MS / acceleration0to100 / GRAVITY_MS2;
}

export function calcWeightTransfer(
	cogHeightM: number,
	wheelbaseM: number,
	massKg: number,
	longAccelG: number,
): number {
	return (cogHeightM / wheelbaseM) * massKg * longAccelG;
}

export function calcTractionLimitTorque(
	massKg: number,
	frontWeightDist: number,
	cogHeightM: number,
	wheelbaseM: number,
	longAccelG: number,
	frictionCoef: number,
	wheel: WheelData,
	drivetrain: Drivetrain,
): number {
	const frontWeight = massKg * frontWeightDist;
	const rearWeight = massKg - frontWeight;
	const weightTransfer = calcWeightTransfer(
		cogHeightM,
		wheelbaseM,
		massKg,
		longAccelG,
	);
	const wheelRadiusM = calcWheelRadiusM(
		wheel.width,
		wheel.profile,
		wheel.diameter,
	);
	const frontWeightDynamic = frontWeight - weightTransfer;
	const rearWeightDynamic = rearWeight + weightTransfer;

	switch (drivetrain) {
		case "AWD": {
			const frontTraction =
				frontWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
			const rearTraction =
				rearWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
			return (frontTraction + rearTraction) * AWD_TRACTION_MULTIPLIER;
		}
		case "RWD": {
			return rearWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
		}
		case "FWD":
		default: {
			return frontWeightDynamic * GRAVITY_MS2 * frictionCoef * wheelRadiusM;
		}
	}
}

export function calculateGearboxOutputs(
	inputs: GearboxCalcInputs,
): GearboxOutputs {
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

	const avgWheel = getAverageWheel(frontWheel, rearWheel);
	const wheelCircumference = calcWheelCircumference(
		avgWheel.width,
		avgWheel.profile,
		avgWheel.diameter,
	);

	const tractionWheel = getWheelForTraction(drivetrain, frontWheel, rearWheel);

	const gearCount = gearRatios.length;

	const effectiveRatios: number[] = [];
	for (let i = 0; i < gearCount; i++) {
		effectiveRatios.push(gearRatios[i].ratio * finalDrive);
	}

	let peakHp = 0;
	let peakHpRpm = 0;
	for (const row of torqueRpmData) {
		const hp = calcHorsepower(row.torque, row.rpm);
		if (hp > peakHp) {
			peakHp = hp;
			peakHpRpm = row.rpm;
		}
	}

	const cogHeightM = (cogHeight * 2.54) / 100;
	const longAccelG =
		tractionMode === "launch" ? 0 : calcLongitudinalAccelG(acceleration0to100);
	const frictionCoef =
		LOCAL_FRICTION_COEFFICIENTS[
			tireCompound as keyof typeof LOCAL_FRICTION_COEFFICIENTS
		] ?? 1.4;
	const aeroMultiplier = inputs.aeroTractionMultiplier ?? 1.0;
	const adjustedFrictionCoef = frictionCoef * aeroMultiplier;
	const tractionLimitTorque = calcTractionLimitTorque(
		weight,
		frontWeightDistribution / 100,
		cogHeightM,
		wheelbase,
		longAccelG,
		adjustedFrictionCoef,
		tractionWheel,
		drivetrain,
	);

	const speedRpmData: SpeedRpmPoint[][] = [];
	const maxSpeedPerGear: number[] = [];

	for (let gearIdx = 0; gearIdx < gearCount; gearIdx++) {
		const gearData: SpeedRpmPoint[] = [];
		const gearRatio = gearRatios[gearIdx].ratio;
		const totalRatio = effectiveRatios[gearIdx];

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
		wheelRadiusM: calcWheelRadiusM(
			tractionWheel.width,
			tractionWheel.profile,
			tractionWheel.diameter,
		),
		effectiveRatios,
		peakHp,
		peakHpRpm,
		tractionLimitTorque,
		speedRpmData,
		maxSpeedPerGear,
	};
}
