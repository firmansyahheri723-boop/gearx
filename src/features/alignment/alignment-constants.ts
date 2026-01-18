import type { SegmentedRowOption } from "@/components/ui/segmented-row";
import type { AlignmentInputs, HelpContent } from "@/types";

export type SliderConfig = {
	key: keyof AlignmentInputs;
	label: string;
	min: number;
	max: number;
	step: number;
	unit: string;
	description: string;
	help: string;
};

export const ALIGNMENT_SLIDERS: SliderConfig[] = [
	{
		key: "frontCamber",
		label: "Front Camber",
		min: -10,
		max: 0,
		step: 0.1,
		unit: "deg",
		description: "Grip: -2° to -4° | Drift: -3° to -5°",
		help: "Negative camber tilts tire top inward. More negative = more camber during cornering. Too much causes inner tire wear.",
	},
	{
		key: "frontCaster",
		label: "Front Caster",
		min: -10,
		max: 15,
		step: 0.5,
		unit: "deg",
		description: "Higher = more self-aligning torque",
		help: "Positive caster creates self-aligning torque for steering stability. Higher values make steering heavier but more precise.",
	},
	{
		key: "frontToe",
		label: "Front Toe",
		min: -3,
		max: 3,
		step: 0.1,
		unit: "deg",
		description: "Toe out (-) improves turn-in | Toe in (+) improves stability",
		help: "Toe out (negative) makes car turn into corners easier. Toe in (positive) improves straight-line stability but creates understeer.",
	},
	{
		key: "frontAckermann",
		label: "Ackermann",
		min: -30,
		max: 30,
		step: 1,
		unit: "deg",
		description: "Negative = Reverse | 0 = Parallel | Positive = Standard",
		help: "Controls inner vs outer wheel angle. Parallel gives max lock, positive Ackermann is easier to drive, reverse is rarely used.",
	},
	{
		key: "frontSteeringSensitivity",
		label: "Steering Sensitivity",
		min: 1,
		max: 10,
		step: 0.5,
		unit: "",
		description: "Higher = more responsive steering",
		help: "Game-specific multiplier for steering responsiveness. Lower values give smoother, more controllable steering.",
	},
	{
		key: "rearCamber",
		label: "Rear Camber",
		min: -10,
		max: 0,
		step: 0.1,
		unit: "deg",
		description: "Grip: -1.5° to -3° | Drift: -2° to -4°",
		help: "Rear camber affects rear grip during cornering. More negative increases rear slip angle tendency.",
	},
	{
		key: "rearToe",
		label: "Rear Toe",
		min: -3,
		max: 3,
		step: 0.1,
		unit: "deg",
		description: "Toe out (-) = more loose | Toe in (+) = more stable",
		help: "Rear toe out reduces straight-line stability dramatically. Used in drift builds to initiate and maintain angle.",
	},
];

export const ALIGNMENT_PRESETS: SegmentedRowOption[] = [
	{ value: "grip", label: "Grip Racing" },
	{ value: "drift", label: "Drift" },
	{ value: "street", label: "Street" },
	{ value: "drag", label: "Drag" },
];

export const CAMBER_HELP: HelpContent = {
	description:
		"Camber angle affects tire contact patch during cornering. Optimal camber keeps tire flat at max grip.",
	formula: "CP = W \\cdot \\cos(\\theta)",
	variables: ["CP = contact patch width", "W = tire width", "θ = camber angle"],
};

export const ACKERMANN_HELP: HelpContent = {
	description:
		"Ackermann geometry ensures inner and outer wheels trace different radius circles during turns.",
	formula: "\\cot(\\alpha_{outer}) - \\cot(\\alpha_{inner}) = \\frac{L}{E}",
	variables: ["α = steering angle", "L = wheelbase", "E = kingpin offset"],
};

export type AlignmentPresetType = "grip" | "drift" | "street" | "drag";

export const ALIGNMENT_PRESETS_MAP: Record<string, Partial<AlignmentInputs>> = {
	grip: {
		frontCamber: -3.5,
		frontCaster: 6,
		frontToe: -0.3,
		frontAckermann: 5,
		rearCamber: -2.5,
		rearToe: -0.5,
	},
	drift: {
		frontCamber: -4.0,
		frontCaster: 4,
		frontToe: 0,
		frontAckermann: 0,
		rearCamber: -3.0,
		rearToe: -1.0,
	},
	street: {
		frontCamber: -1.5,
		frontCaster: 3,
		frontToe: 0,
		frontAckermann: 0,
		rearCamber: -1.5,
		rearToe: 0,
	},
	drag: {
		frontCamber: -2.0,
		frontCaster: 8,
		frontToe: 0,
		frontAckermann: 10,
		rearCamber: -1.0,
		rearToe: 0.5,
	},
};
