import { createStore } from "solid-js/store";
import type { GearRatio, FinalDrive, TireCompound, TractionMode } from "../../types";

export const [torqueRpmData, setTorqueRpmData] = createStore<{ torque: number; rpm: number }[]>([
  { torque: 411, rpm: 358 },
  { torque: 434, rpm: 626 },
  { torque: 465, rpm: 893 },
  { torque: 515, rpm: 1161 },
  { torque: 578, rpm: 1428 },
  { torque: 647, rpm: 1696 },
  { torque: 720, rpm: 1963 },
  { torque: 800, rpm: 2231 },
  { torque: 889, rpm: 2498 },
  { torque: 977, rpm: 2766 },
  { torque: 1051, rpm: 3033 },
  { torque: 1098, rpm: 3301 },
  { torque: 1126, rpm: 3568 },
  { torque: 1149, rpm: 3836 },
  { torque: 1172, rpm: 4103 },
  { torque: 1194, rpm: 4371 },
  { torque: 1215, rpm: 4638 },
  { torque: 1231, rpm: 4906 },
  { torque: 1239, rpm: 5173 },
  { torque: 1239, rpm: 5441 },
  { torque: 1221, rpm: 5708 },
  { torque: 1190, rpm: 5976 },
  { torque: 1151, rpm: 6243 },
  { torque: 1110, rpm: 6511 },
  { torque: 1069, rpm: 6778 },
  { torque: 1028, rpm: 7046 },
  { torque: 988, rpm: 7313 },
  { torque: 945, rpm: 7581 },
  { torque: 895, rpm: 7849 },
  { torque: 840, rpm: 8116 },
]);

export const [finalDrive, setFinalDrive] = createStore<FinalDrive>({
  ratio: 3.0,
  min: 2.0,
  max: 5.0,
});

export const [gearRatios, setGearRatios] = createStore<GearRatio[]>([
  { ratio: 2.76, min: 1.5, max: 4.0 },
  { ratio: 2.0, min: 1.2, max: 3.0 },
  { ratio: 1.5, min: 1.0, max: 2.5 },
  { ratio: 1.15, min: 0.8, max: 2.0 },
  { ratio: 1.0, min: 0.7, max: 1.5 },
  { ratio: 0.9, min: 0.6, max: 1.2 },
  { ratio: 0, min: 0, max: 1.0 },
  { ratio: 0, min: 0, max: 0.9 },
]);

export const [tireCompound, setTireCompound] = createStore<{ value: TireCompound }>({
  value: "racing",
});

export const [tractionMode, setTractionMode] = createStore<{ value: TractionMode }>({
  value: "launch",
});
