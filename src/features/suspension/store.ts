import { createStore } from "solid-js/store";
import type {
	AccelerationMetrics,
	AntiRollBars,
	Dampers,
	SpringsStiffness,
	VehicleInputs,
} from "/Users/elianiva/Development/personal/gearx/src/types";

export const [vehicleInputs, setVehicleInputs] = createStore<VehicleInputs>({
	carSelection: "Dodge Challenger SRT",
	engineSelection: "Dodge Challenger SRT",
	weight: 1788,
	frontWeightDistribution: 56,
	frontWheelOffset: 3,
	rearWheelOffset: -3,
	desiredRideFrequency: 3,
	desiredRollGradient: 0.05,
	frontWheel: { diameter: 20, profile: 40, width: 345 },
	rearWheel: { diameter: 20, profile: 40, width: 345 },
	cogHeight: 20,
	acceleration0to100: 4.7,
	maxSpeed118mRadius: 140,
	drivetrain: "RWD" as const,
	wheelbase: 2.934,
	frontTrackWidth: 1.63,
	rearTrackWidth: 1.62,
	realYEngineOffset: 0.568,
	realZEngineOffset: 2.021,
	wheelWeight: 12,
	dampingRatio: 1.0,
	tireRate: 343232.75,
	magicNumber: 58.8,
	rollCenterHeight: 0.208,
	redlineRpm: 8000,
});

export const [springsStiffness] = createStore<SpringsStiffness>({
	front: 173.441,
	rear: 135.362,
});

export const [dampers] = createStore<Dampers>({
	bump: { front: 12275, rear: 9580 },
	fastBump: { front: 6137, rear: 4790 },
	rebound: { front: 27618, rear: 21554 },
	fastRebound: { front: 13809, rear: 10777 },
});

export const [antiRollBars] = createStore<AntiRollBars>({
	farb: -131,
	rarb: -91,
});

export const [accelerationMetrics] = createStore<AccelerationMetrics>({
	weightTransfer: 186.52,
	frontWeightDistOnAccel: "45.57%",
	maxLongitudinalAccel: 0.6,
	maxLateralAccel: 1.3065,
});
