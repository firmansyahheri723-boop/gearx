export type AlignmentPreset = "grip" | "drift" | "street" | "drag";

export type AlignmentInputs = {
	frontCamber: number;
	frontCaster: number;
	frontToe: number;
	frontAckermann: number;
	frontSteeringSensitivity: number;
	rearCamber: number;
	rearToe: number;
	maxSteeringAngle: number;
};

export type AlignmentOutputs = {
	understeerTendency: number;
	oversteerTendency: number;
	turnInResponse: "sharp" | "moderate" | "slow";
	straightLineStability: number;
	frontCamberGain: number;
	rearCamberGain: number;
	contactPatchFront: number;
	contactPatchRear: number;
	innerWheelAngle: number;
	outerWheelAngle: number;
	ackermannType: "positive" | "parallel" | "reverse";
	scrubRadiusEstimate: number;
	recommendations: string[];
};
