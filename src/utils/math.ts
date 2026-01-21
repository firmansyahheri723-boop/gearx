export function roundToDecimal(value: number, decimals: number): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

export function roundToNearest(value: number, nearest: number): number {
	return Math.round(value / nearest) * nearest;
}
