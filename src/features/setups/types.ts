import type { AeroSettings } from "@/features/aero/types";
import type { AlignmentInputs } from "@/features/alignment/types";
import type { FinalDrive, GearRatio } from "@/features/gearbox/types";
import type {
	TireCompound,
	TractionMode,
	VehicleInputs,
} from "@/features/suspension/types";
import type { TorqueRpmRow } from "@/features/torque-extractor/types";

export type SetupTag = {
	id: string;
	name: string;
	color: string;
};

export const SETUP_TAG_COLORS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#eab308",
	"#84cc16",
	"#22c55e",
	"#10b981",
	"#14b8a6",
	"#06b6d4",
	"#0ea5e9",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#a855f7",
	"#d946ef",
	"#ec4899",
] as const;

export type SetupTagColor = string;

export type SetupData = {
	version: number;
	inputs: VehicleInputs;
	torqueRpmData: TorqueRpmRow[];
	gearRatios: GearRatio[];
	finalDrive: FinalDrive;
	tireCompound: TireCompound;
	tractionMode: TractionMode;
	aeroSettings: AeroSettings;
	alignmentInputs?: AlignmentInputs;
};

export type SavedSetup = {
	id: string;
	name: string;
	description: string;
	tags: SetupTag[];
	notes: string;
	carName: string;
	createdAt: number;
	updatedAt: number;
} & SetupData;

export type SetupDiffField = {
	path: string;
	label: string;
	category: "general" | "suspension" | "gearbox" | "aero" | "alignment";
	impact: "high" | "medium" | "low";
	hasDifference: boolean;
	oldValue: unknown;
	newValue: unknown;
	formattedOld: string;
	formattedNew: string;
};

export type SetupDiffCategory = {
	name: string;
	label: string;
	fields: SetupDiffField[];
};

export type SetupDiff = {
	setupA: SavedSetup;
	setupB: SavedSetup;
	categories: SetupDiffCategory[];
	summary: {
		totalDiffs: number;
		highImpact: number;
		mediumImpact: number;
		lowImpact: number;
	};
};

export type SetupFilter = {
	search: string;
	tags: string[];
	carFilter: string | null;
	sortBy: "name" | "createdAt" | "updatedAt";
	sortOrder: "asc" | "desc";
};
