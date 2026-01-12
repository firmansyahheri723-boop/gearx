export type TorqueExtractorPoint = {
	x: number;
	y: number;
};

export type TorqueExtractorCalibration = {
	left: number;
	right: number;
	top: number;
	bottom: number;
	minRpm: number;
	maxRpm: number;
	minTorque: number;
	maxTorque: number;
};

export type ExtractedDataPoint = {
	pixelX: number;
	pixelY: number;
	rpm: number;
	torque: number;
};

export type ExtractionStep =
	| "upload"
	| "crop"
	| "calibrate"
	| "extract"
	| "preview";

export type ExtractionState = {
	step: ExtractionStep;
	imageData: ImageData | null;
	cropBounds: TorqueExtractorPoint | null;
	calibration: TorqueExtractorCalibration;
	extractedPoints: ExtractedDataPoint[];
};
