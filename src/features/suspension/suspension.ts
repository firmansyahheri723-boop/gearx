import { GRAVITY_MS2 } from "@/constants/physics";
import { roundToDecimal } from "@/utils/math";
import { calcLongitudinalAccelG, calcWeightTransfer } from "@/utils/physics";

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

function calcSprungMass(
	weight: number,
	frontWeightDist: number,
	wheelWeight: number,
): { front: number; rear: number } {
	const frontAxleWeight = weight * (frontWeightDist / 100);
	const rearAxleWeight = weight * (1 - frontWeightDist / 100);

	const frontSprungPerCorner = frontAxleWeight / 2 - wheelWeight;
	const rearSprungPerCorner = rearAxleWeight / 2 - wheelWeight;

	return { front: frontSprungPerCorner, rear: rearSprungPerCorner };
}

function calcSpringStiffness(
	sprungMassPerCorner: number,
	rideFrequency: number,
): number {
	return (
		4 * Math.PI * Math.PI * rideFrequency * rideFrequency * sprungMassPerCorner
	);
}

function calcCriticalDamping(
	stiffnessNm: number,
	sprungMassPerCorner: number,
): number {
	return 2 * Math.sqrt(stiffnessNm * sprungMassPerCorner);
}

function calcDampingForces(
	critDampingFront: number,
	critDampingRear: number,
	dampingRatio: number,
): DampersOutput {
	const dampingForceFront = critDampingFront * dampingRatio;
	const dampingForceRear = critDampingRear * dampingRatio;

	return {
		critDampingFront,
		critDampingRear,
		dampingForceFront,
		dampingForceRear,
		bumpFront: dampingForceFront * (2 / 3),
		bumpRear: dampingForceRear * (2 / 3),
		fastBumpFront: dampingForceFront * (1 / 3),
		fastBumpRear: dampingForceRear * (1 / 3),
		reboundFront: dampingForceFront * (3 / 2),
		reboundRear: dampingForceRear * (3 / 2),
		fastReboundFront: dampingForceFront * (3 / 4),
		fastReboundRear: dampingForceRear * (3 / 4),
	};
}

function calcLateralAccelG(speedKph: number, radiusM: number): number {
	const speedMs = speedKph * 0.277778;
	return (speedMs * speedMs) / (radiusM * GRAVITY_MS2);
}

function calcAntiRollBars(
	weight: number,
	rollCenterToCoG: number,
	desiredRollGradient: number,
	frontWheelRate: number,
	rearWheelRate: number,
	tireRate: number,
	frontTrackWidth: number,
	rearTrackWidth: number,
	magicNumber: number,
): AntiRollBarsOutput {
	const W = weight;
	const H = rollCenterToCoG;
	const phiAy = desiredRollGradient;
	const Kt = tireRate;

	const t = (frontTrackWidth + rearTrackWidth) / 2;
	const Kw = (frontWheelRate + rearWheelRate) / 2;
	const KphiDES = (W * H) / phiAy;

	const piOver180 = Math.PI / 180;
	const tSquaredHalf = (t * t) / 2;

	const numerator = piOver180 * KphiDES * Kt * tSquaredHalf;
	const denom1 = Kt * tSquaredHalf * piOver180 - KphiDES;
	const subtractTerm = (Math.PI * Kw * tSquaredHalf) / 180;

	const KphiA = denom1 !== 0 ? numerator / denom1 - subtractTerm : 0;

	const KphiFA = KphiA * (magicNumber / 100);
	const KphiRA = KphiA * ((100 - magicNumber) / 100);

	const tSquared = t * t;
	const farb = (KphiFA * Math.PI) / (180 * tSquared) / 1000;
	const rarb = (KphiRA * Math.PI) / (180 * tSquared) / 1000;

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

export function calculateSuspensionOutputs(
	inputs: SuspensionInputs,
): SuspensionOutputs {
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

	const aeroFrontLoadKg = aeroFrontDownforceN / GRAVITY_MS2;
	const aeroRearLoadKg = aeroRearDownforceN / GRAVITY_MS2;
	const hasAero = aeroFrontDownforceN > 0 || aeroRearDownforceN > 0;

	const sprungMass = calcSprungMass(
		weight,
		frontWeightDistribution,
		wheelWeight,
	);

	let adjustedFrontSprungMass = sprungMass.front;
	let adjustedRearSprungMass = sprungMass.rear;

	if (hasAero) {
		adjustedFrontSprungMass = sprungMass.front + aeroFrontLoadKg / 2;
		adjustedRearSprungMass = sprungMass.rear + aeroRearLoadKg / 2;
	}

	const frontStiffness = calcSpringStiffness(
		adjustedFrontSprungMass,
		rideFrequency,
	);
	const rearStiffness = calcSpringStiffness(
		adjustedRearSprungMass,
		rideFrequency,
	);

	const springs: SpringsOutput = {
		frontSprungMass: adjustedFrontSprungMass,
		rearSprungMass: adjustedRearSprungMass,
		frontStiffness,
		rearStiffness,
	};

	const critDampingFront = calcCriticalDamping(
		frontStiffness,
		adjustedFrontSprungMass,
	);
	const critDampingRear = calcCriticalDamping(
		rearStiffness,
		adjustedRearSprungMass,
	);
	const dampers = calcDampingForces(
		critDampingFront,
		critDampingRear,
		dampingRatio,
	);

	const longitudinalAccelG = calcLongitudinalAccelG(acceleration0to100);
	const lateralAccelG = calcLateralAccelG(maxSpeed118mRadius, 118);
	const weightTransfer = calcWeightTransfer(
		cogHeight,
		wheelbase,
		weight,
		longitudinalAccelG,
	);

	const frontWeightStatic = weight * (frontWeightDistribution / 100);
	const rearWeightStatic = weight * (1 - frontWeightDistribution / 100);

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

	const rollCenterToCoG = cogHeight - rollCenterHeight;

	const antiRollBars = calcAntiRollBars(
		weight,
		rollCenterToCoG,
		desiredRollGradient,
		frontStiffness,
		rearStiffness,
		tireRate,
		frontTrackWidth,
		rearTrackWidth,
		magicNumber,
	);

	return {
		springs,
		dampers,
		antiRollBars,
		acceleration,
		...(hasAero && {
			experimental: {
				aeroFrontLoadKg: roundToDecimal(aeroFrontLoadKg, 1),
				aeroRearLoadKg: roundToDecimal(aeroRearLoadKg, 1),
				adjustedFrontSprungMass: roundToDecimal(adjustedFrontSprungMass, 1),
				adjustedRearSprungMass: roundToDecimal(adjustedRearSprungMass, 1),
			},
		}),
	};
}
