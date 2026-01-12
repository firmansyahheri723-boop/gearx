export type AeroSettings = {
	frontAero: number;
	rearAero: number;
	airResistance: number;
};

export type AeroStandardOutput = {
	frontDownforceRelative: number;
	rearDownforceRelative: number;
	aeroBalancePct: number;
	predictedBehavior:
		| "understeer"
		| "neutral"
		| "oversteer"
		| "extreme_oversteer";
	recommendations: string[];
};

export type AeroSpeedDataPoint = {
	speed: number;
	frontDownforce: number;
	rearDownforce: number;
	totalDownforce: number;
	dragForce: number;
};

export type AeroExperimentalOutput = {
	frontDownforceN: number;
	rearDownforceN: number;
	totalDownforceN: number;
	dragForceN: number;
	powerLossKw: number;
	topSpeedReductionKmh: number;
	corneringGIncrease: number;
	effectiveLoadIncreaseKg: number;
	tractionLimitIncreasePct: number;
	speedData: AeroSpeedDataPoint[];
	maxSpeedKmh: number;
	referenceSpeedKmh: number;
};

export type AeroOutputs = AeroStandardOutput & {
	experimental: AeroExperimentalOutput & { enabled: boolean };
};
