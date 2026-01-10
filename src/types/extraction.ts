export interface TorqueExtractorPoint {
  x: number;
  y: number;
}

export interface TorqueExtractorCalibration {
  left: number;
  right: number;
  top: number;
  bottom: number;
  minRpm: number;
  maxRpm: number;
  minTorque: number;
  maxTorque: number;
}

export interface ExtractedDataPoint {
  pixelX: number;
  pixelY: number;
  rpm: number;
  torque: number;
}

export type ExtractionStep = 'upload' | 'crop' | 'calibrate' | 'extract' | 'preview';

export interface ExtractionState {
  step: ExtractionStep;
  imageData: ImageData | null;
  cropBounds: TorqueExtractorPoint | null;
  calibration: TorqueExtractorCalibration;
  extractedPoints: ExtractedDataPoint[];
}
