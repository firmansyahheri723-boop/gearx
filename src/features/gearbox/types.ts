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

export type SpeedRpmPoint = {
	rpm: number;
	speed: number;
	torque: number;
	wheelTorque: number;
	hp: number;
	exceedsTraction: boolean;
};
