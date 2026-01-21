export type TireCompound =
	| "street"
	| "street+"
	| "sport"
	| "sport+"
	| "racing"
	| "racing+";

export type Drivetrain = "FWD" | "RWD" | "AWD";

export type TractionMode = "launch" | "rolling";

export const AWD_TRACTION_MULTIPLIER = 1.2;

export const TIRE_FRICTION_COEFFICIENTS: Record<TireCompound, number> = {
	street: 1.12,
	"street+": 1.16,
	sport: 1.4,
	"sport+": 1.45,
	racing: 1.7,
	"racing+": 1.7 * 1.08,
};

export type WheelData = {
	diameter: number;
	profile: number;
	width: number;
};

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
