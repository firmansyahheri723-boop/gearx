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

export type TireCompound =
	| "street"
	| "street+"
	| "sport"
	| "sport+"
	| "racing"
	| "racing+";

export type TractionMode = "launch" | "rolling";

export const TIRE_FRICTION_COEFFICIENTS: Record<TireCompound, number> = {
	street: 1.12,
	"street+": 1.16,
	sport: 1.4,
	"sport+": 1.45,
	racing: 1.7,
	"racing+": 1.7 * 1.08,
};

export const AWD_TRACTION_MULTIPLIER = 1.2;

export type TireOption = {
	value: TireCompound;
	label: string;
	friction: number;
};

export const TIRE_OPTIONS: TireOption[] = [
	{ value: "street", label: "Street", friction: 1.12 },
	{ value: "street+", label: "Street+", friction: 1.16 },
	{ value: "sport", label: "Sport", friction: 1.4 },
	{ value: "sport+", label: "Sport+", friction: 1.45 },
	{ value: "racing", label: "Racing", friction: 1.7 },
	{ value: "racing+", label: "Racing+", friction: 1.836 },
];

export type TractionModeOption = {
	value: TractionMode;
	label: string;
};

export const TRACTION_MODE_OPTIONS: TractionModeOption[] = [
	{ value: "launch", label: "Launch" },
	{ value: "rolling", label: "Rolling" },
];
