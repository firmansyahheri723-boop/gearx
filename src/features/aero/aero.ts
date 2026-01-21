import type {
	AeroExperimentalOutput,
	AeroSettings,
	AeroSpeedDataPoint,
	AeroStandardOutput,
} from "@/features/aero/types";
import type { CarData } from "@/features/database/types";
import { roundToDecimal, roundToNearest } from "@/utils/math";
import {
	AIR_DENSITY,
	GAME_CD_FACTOR,
	GAME_CL_FACTOR,
	MAX_SPEED_PLOT_KMH,
	REFERENCE_POWER_KW,
	SPEED_STEP,
} from "./aero-constants";

export function calculateStandardAero(
	settings: AeroSettings,
): AeroStandardOutput {
	const frontRel = settings.frontAero * 10;
	const rearRel = settings.rearAero * 10;
	const total = frontRel + rearRel;
	const balancePct = total > 0 ? (frontRel / total) * 100 : 50;

	let behavior: AeroStandardOutput["predictedBehavior"];
	const recommendations: string[] = [];

	if (balancePct > 60) {
		behavior = "understeer";
		recommendations.push(
			"Consider reducing front aero if experiencing high-speed understeer",
		);
		recommendations.push("Rear aero can be increased for better rear grip");
	} else if (balancePct < 40) {
		behavior = settings.rearAero > 7 ? "extreme_oversteer" : "oversteer";
		recommendations.push("High rear downforce may cause aggressive rotation");
		recommendations.push("Consider increasing front aero for more stability");
	} else {
		behavior = "neutral";
		recommendations.push("Balanced aero setup");
		recommendations.push("Fine-tune based on track characteristics");
	}

	if (settings.frontAero === 10) {
		recommendations.push("Front aero at maximum - optimal for grip tracks");
	}
	if (settings.airResistance > 5) {
		recommendations.push(
			"Consider reducing air resistance for higher top speed",
		);
	}

	return {
		frontDownforceRelative: frontRel,
		rearDownforceRelative: rearRel,
		aeroBalancePct: roundToDecimal(balancePct, 1),
		predictedBehavior: behavior,
		recommendations,
	};
}

export function calculateExperimentalAero(
	settings: AeroSettings,
	carData: CarData | null,
	referenceSpeedKmh: number = 200,
): AeroExperimentalOutput {
	const frontalArea = carData?.stockSx ?? 1.5;
	const dragCoefficient = carData?.stockCx ?? 0.3;
	const dragMultiplier = carData?.stockDrag ?? 0.6;
	const carMass = carData?.massKg ?? 1200;
	const enginePowerKw = carData?.powerHp ? carData.powerHp * 0.7457 : 220;

	const velocityMs = referenceSpeedKmh / 3.6;
	const velocitySquared = velocityMs * velocityMs;

	const frontCl = settings.frontAero * GAME_CL_FACTOR * 2;
	const rearCl = settings.rearAero * GAME_CL_FACTOR * 2;

	const frontDownforceN =
		0.5 * AIR_DENSITY * frontalArea * frontCl * velocitySquared;
	const rearDownforceN =
		0.5 * AIR_DENSITY * frontalArea * rearCl * velocitySquared;
	const totalDownforceN = frontDownforceN + rearDownforceN;

	const cd =
		(10 - settings.airResistance) * GAME_CD_FACTOR * dragMultiplier +
		dragCoefficient * 0.5;
	const dragForceN = 0.5 * AIR_DENSITY * frontalArea * cd * velocitySquared;
	const powerLossKw = (dragForceN * velocityMs) / 1000;

	const topSpeedReductionKmh =
		enginePowerKw > 0 ? Math.min((powerLossKw / enginePowerKw) * 50, 50) : 0;

	const corneringGIncrease = totalDownforceN / 9.81 / carMass;
	const effectiveLoadIncreaseKg = totalDownforceN / 9.81;
	const tractionLimitIncreasePct = (corneringGIncrease / 1.2) * 15;

	const speedData = generateSpeedData(
		settings,
		carData,
		frontalArea,
		dragCoefficient,
		dragMultiplier,
	);

	const maxSpeedKmh = calculateMaxSpeedKmh(
		settings,
		carData,
		frontalArea,
		dragCoefficient,
		dragMultiplier,
		enginePowerKw,
	);

	return {
		frontDownforceN: Math.round(frontDownforceN),
		rearDownforceN: Math.round(rearDownforceN),
		totalDownforceN: Math.round(totalDownforceN),
		dragForceN: Math.round(dragForceN),
		powerLossKw: roundToDecimal(powerLossKw, 1),
		topSpeedReductionKmh: Math.round(topSpeedReductionKmh),
		corneringGIncrease: roundToDecimal(corneringGIncrease, 2),
		effectiveLoadIncreaseKg: Math.round(effectiveLoadIncreaseKg),
		tractionLimitIncreasePct: Math.round(tractionLimitIncreasePct),
		speedData,
		maxSpeedKmh,
		referenceSpeedKmh,
	};
}

function generateSpeedData(
	settings: AeroSettings,
	carData: CarData | null,
	frontalArea: number,
	dragCoefficient: number,
	dragMultiplier: number,
): AeroSpeedDataPoint[] {
	const data: AeroSpeedDataPoint[] = [];
	const cd =
		(10 - settings.airResistance) * GAME_CD_FACTOR * dragMultiplier +
		dragCoefficient * 0.5;

	for (
		let speedKmh = 0;
		speedKmh <= MAX_SPEED_PLOT_KMH;
		speedKmh += SPEED_STEP
	) {
		const velocityMs = speedKmh / 3.6;
		const velocitySquared = velocityMs * velocityMs;

		const frontCl = settings.frontAero * GAME_CL_FACTOR * 2;
		const rearCl = settings.rearAero * GAME_CL_FACTOR * 2;

		const frontDf = 0.5 * AIR_DENSITY * frontalArea * frontCl * velocitySquared;
		const rearDf = 0.5 * AIR_DENSITY * frontalArea * rearCl * velocitySquared;
		const drag = 0.5 * AIR_DENSITY * frontalArea * cd * velocitySquared;

		data.push({
			speed: speedKmh,
			frontDownforce: Math.round(frontDf),
			rearDownforce: Math.round(rearDf),
			totalDownforce: Math.round(frontDf + rearDf),
			dragForce: Math.round(drag),
		});
	}

	return data;
}

function calculateMaxSpeedKmh(
	settings: AeroSettings,
	carData: CarData | null,
	frontalArea: number,
	dragCoefficient: number,
	dragMultiplier: number,
	enginePowerKw: number,
): number {
	if (enginePowerKw <= 0) return 250;

	const cd =
		(10 - settings.airResistance) * GAME_CD_FACTOR * dragMultiplier +
		dragCoefficient * 0.5;
	const dragMultiplierFactor = 1 + settings.airResistance / 20;

	let low = 0;
	let high = 500;
	let maxSpeed = 0;

	while (high - low > 1) {
		const mid = (low + high) / 2;
		const velocityMs = mid / 3.6;
		const dragKw =
			(0.5 *
				AIR_DENSITY *
				frontalArea *
				cd *
				dragMultiplierFactor *
				velocityMs *
				velocityMs *
				velocityMs) /
			1000;

		if (dragKw <= enginePowerKw) {
			maxSpeed = mid;
			low = mid;
		} else {
			high = mid;
		}
	}

	return roundToNearest(maxSpeed, 10);
}

export function getAeroBalanceDescription(balancePct: number): string {
	if (balancePct > 58) return "Front-Dominant";
	if (balancePct > 54) return "Slightly Front-Biased";
	if (balancePct > 46) return "Balanced";
	if (balancePct > 42) return "Slightly Rear-Biased";
	return "Rear-Dominant";
}
