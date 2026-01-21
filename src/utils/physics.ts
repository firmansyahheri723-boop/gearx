import { GRAVITY_MS2 } from "@/constants/physics";

export function calcWeightTransfer(
	cogHeightM: number,
	wheelbaseM: number,
	massKg: number,
	longAccelG: number,
): number {
	return (cogHeightM / wheelbaseM) * massKg * longAccelG;
}

export function calcLongitudinalAccelG(acceleration0to100: number): number {
	return 27.78 / acceleration0to100 / GRAVITY_MS2;
}
