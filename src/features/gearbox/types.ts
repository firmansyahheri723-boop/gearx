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
