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
