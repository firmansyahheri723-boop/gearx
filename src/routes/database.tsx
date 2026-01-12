import { createFileRoute } from "@tanstack/solid-router";
import type { ColumnDef, SortingState } from "@tanstack/solid-table";
import { createMemo, createSignal, For } from "solid-js";
import { DataTable } from "@/components/ui/data-table";
import { CSV_COLUMNS } from "@/features/database/database-constants";
import {
	carData,
	getSelectedCar,
	getSelectedEngine,
	selectedCarIndex,
	selectedEngineIndex,
} from "@/features/database/store";
import type { CarData } from "@/types";

// Sort car data: regular cars first, then engines, then transmissions
// Within each group, items are sorted alphabetically
function defaultSortCarData<T extends CarData>(data: T[]): T[] {
	const getCategory = (car: CarData): number => {
		const name = car.car.toLowerCase();
		if (name.endsWith("engine")) return 1;
		if (name.endsWith("transmission")) return 2;
		return 0; // regular car
	};

	return [...data].sort((a, b) => {
		const categoryA = getCategory(a);
		const categoryB = getCategory(b);

		// Sort by category first (car=0, engine=1, transmission=2)
		if (categoryA !== categoryB) {
			return categoryA - categoryB;
		}

		// Within same category, sort alphabetically
		return a.car.localeCompare(b.car);
	});
}

// Column group definitions for visual organization
const COLUMN_GROUPS = [
	{
		name: "Car",
		color: "bg-yellow-500/20 border-yellow-500/30",
		headerColor: "text-yellow-400",
		columns: ["car"],
	},
	{
		name: "Wheelbase, track width (meters)",
		color: "bg-green-500/10 border-green-500/30",
		headerColor: "text-green-400",
		columns: [
			"height",
			"fAxleOffset",
			"rAxleOffset",
			"wheelbase",
			"fTrackWidth",
			"rTrackWidth",
			"avTrackWidth",
		],
	},
	{
		name: "Transmission",
		color: "bg-blue-500/10 border-blue-500/30",
		headerColor: "text-blue-400",
		columns: ["gears", "shiftTime", "weight"],
	},
	{
		name: "Body - Stock",
		color: "bg-purple-500/10 border-purple-500/30",
		headerColor: "text-purple-400",
		columns: ["stockCx", "stockSx", "stockDrag"],
	},
	{
		name: "Body - Stage 1/2",
		color: "bg-purple-500/10 border-purple-500/30",
		headerColor: "text-purple-400",
		columns: ["stage12Cx", "stage12Sx", "stage12Drag"],
	},
	{
		name: "Body - Stage 3/4",
		color: "bg-purple-500/10 border-purple-500/30",
		headerColor: "text-purple-400",
		columns: [
			"stage34Cx",
			"stage34Sx",
			"stage34Drag",
			"bodyPosX",
			"bodyPosY",
			"bodyPosZ",
		],
	},
	{
		name: "Engine",
		color: "bg-emerald-500/10 border-emerald-500/30",
		headerColor: "text-emerald-400",
		columns: [
			"powerHp",
			"massKg",
			"turboPress",
			"curveFallRpm",
			"revLimiter",
			"inertiaRatio",
			"enginePosX",
			"enginePosY",
			"enginePosZ",
		],
	},
];

function getColumnGroup(key: string) {
	return COLUMN_GROUPS.find((g) => g.columns.includes(key));
}

function formatCellValue(value: string | number | null): string {
	if (value === null || value === undefined) {
		return "-";
	}
	if (typeof value === "number") {
		if (Number.isInteger(value)) {
			return value.toString();
		}
		return value.toFixed(3).replace(/\.?0+$/, "");
	}
	return value;
}

type CarDataRow = CarData & {
	_originalIndex: number;
};

export const Route = createFileRoute("/database")({
	component: Database,
});

function Database() {
	// Sorting state
	const [sorting, setSorting] = createSignal<SortingState>([]);

	// Sort data based on current sort state, or use default sorting
	// Track the original index in carData for each row
	const sortedData = createMemo((): CarDataRow[] => {
		// First, create array with original indices
		const dataWithIndices = carData.map((car, index) => ({
			...car,
			_originalIndex: index,
		}));

		const sorted =
			sorting().length === 0
				? defaultSortCarData(dataWithIndices)
				: dataWithIndices; // Let TanStack Table handle sorting when active

		return sorted;
	});

	// Build column definitions dynamically
	const columns = createMemo((): ColumnDef<CarDataRow>[] => {
		return CSV_COLUMNS.map((col) => {
			const group = getColumnGroup(col.key);

			return {
				accessorKey: col.key,
				header: col.header,
				cell: (info) => {
					const row = info.row.original;
					const value = row[col.key as keyof CarData];
					const isCarColumn = col.key === "car";
					const isSelectedCar = selectedCarIndex() === row._originalIndex;
					const isSelectedEngine = selectedEngineIndex() === row._originalIndex;

					if (isCarColumn) {
						return (
							<div
								class="px-3 py-1.5 font-medium whitespace-nowrap flex items-center gap-2"
								classList={{
									"text-foreground-secondary bg-yellow-500/5":
										!isSelectedCar && !isSelectedEngine,
									"text-foreground bg-foreground/10":
										isSelectedCar || isSelectedEngine,
								}}
							>
								<span>{value || "-"}</span>
								{isSelectedCar && (
									<span class="px-1 py-0.5 text-[8px] font-bold tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
										CAR
									</span>
								)}
								{isSelectedEngine && (
									<span class="px-1 py-0.5 text-[8px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
										ENGINE
									</span>
								)}
							</div>
						);
					}

					const bgClass = group
						? group.color
								.split(" ")[0]
								.replace("/20", "/5")
								.replace("/10", "/5")
						: "";
					return (
						<span
							class={`block px-3 py-1.5 text-center text-foreground tabular-nums ${bgClass}`}
						>
							{formatCellValue(value)}
						</span>
					);
				},
				meta: {
					align: col.key === "car" ? ("left" as const) : ("center" as const),
					headerClass: group ? `${group.color} ${group.headerColor}` : "",
				},
			};
		});
	});

	return (
		<div class="border border-border/50 bg-background/50">
			{/* Header */}
			<div class="flex items-center justify-between px-3 py-2 border-b bg-surface/80 border-border/50">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-4 bg-emerald-500" />
					<span class="font-semibold tracking-wider text-xs uppercase text-foreground">
						Car Data
					</span>
					<span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
						{carData.length} CARS
					</span>
				</div>
			</div>

			{/* Data Table with sorting */}
			<DataTable
				data={sortedData()}
				columns={columns()}
				enableSorting
				initialSorting={sorting()}
				onSortingChange={setSorting}
				stickyHeader
				columnPinning={{ left: ["car"] }}
				maxHeight="70vh"
				getRowClass={(row, index) => {
					const isSelectedCar = selectedCarIndex() === row._originalIndex;
					const isSelectedEngine = selectedEngineIndex() === row._originalIndex;
					return isSelectedCar || isSelectedEngine ? "bg-foreground/10" : "";
				}}
			/>

			<div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
		</div>
	);
}
