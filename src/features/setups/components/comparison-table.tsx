import { For, Show } from "solid-js";
import type {
	SetupDiff,
	SetupDiffCategory,
	SetupDiffField,
} from "@/features/setups/types";
import { getImpactColor } from "../comparison/core";

interface ComparisonTableProps {
	diff: SetupDiff;
	onApplyField?: (field: SetupDiffField, value: unknown) => void;
}

export function ComparisonTable(props: ComparisonTableProps) {
	const totalDiffs = () =>
		props.diff.categories.reduce(
			(acc, cat) => acc + cat.fields.filter((f) => f.hasDifference).length,
			0,
		);
	const totalFields = () =>
		props.diff.categories.reduce((acc, cat) => acc + cat.fields.length, 0);

	const formatValue = (value: unknown): string => {
		if (typeof value === "number") {
			return Number.isInteger(value) ? value.toString() : value.toFixed(3);
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		if (value === null || value === undefined) {
			return "-";
		}
		return String(value);
	};

	return (
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4 p-3 bg-surface-elevated/30 border border-border/50">
				<div>
					<h3 class="text-xs font-bold uppercase tracking-wider text-muted">
						Setup A
					</h3>
					<p class="text-sm font-bold text-foreground mt-1">
						{props.diff.setupA.name}
					</p>
					<p class="text-[10px] text-muted">{props.diff.setupA.carName}</p>
				</div>
				<div>
					<h3 class="text-xs font-bold uppercase tracking-wider text-muted">
						Setup B
					</h3>
					<p class="text-sm font-bold text-foreground mt-1">
						{props.diff.setupB.name}
					</p>
					<p class="text-[10px] text-muted">{props.diff.setupB.carName}</p>
				</div>
			</div>

			<div class="flex items-center gap-4 text-xs">
				<div class="flex items-center gap-1.5">
					<div
						class="w-2 h-2"
						style={{ "background-color": getImpactColor("high") }}
					/>
					<span class="text-muted">High Impact</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div
						class="w-2 h-2"
						style={{ "background-color": getImpactColor("medium") }}
					/>
					<span class="text-muted">Medium</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div
						class="w-2 h-2"
						style={{ "background-color": getImpactColor("low") }}
					/>
					<span class="text-muted">Low Impact</span>
				</div>
				<div class="ml-auto text-muted">
					{totalDiffs()} of {totalFields()} fields differ
				</div>
			</div>

			<div class="space-y-4">
				<For each={props.diff.categories}>
					{(category) => (
						<ComparisonCategory
							category={category}
							setupA={props.diff.setupA}
							setupB={props.diff.setupB}
							onApplyField={props.onApplyField}
						/>
					)}
				</For>
			</div>
		</div>
	);
}

interface ComparisonCategoryProps {
	category: SetupDiffCategory;
	setupA: { id: string; name: string };
	setupB: { id: string; name: string };
	onApplyField?: (field: SetupDiffField, value: unknown) => void;
}

function ComparisonCategory(props: ComparisonCategoryProps) {
	return (
		<div class="border border-border/50 bg-surface/50">
			<div class="px-3 py-2 border-b border-border/30 bg-surface-elevated/30">
				<h4 class="text-xs font-bold uppercase tracking-wider text-foreground">
					{props.category.label}
				</h4>
			</div>
			<div class="divide-y divide-border/30">
				<For each={props.category.fields}>
					{(field) => (
						<ComparisonRow
							field={field}
							setupAName={props.setupA.name}
							setupBName={props.setupB.name}
							onApply={props.onApplyField}
						/>
					)}
				</For>
			</div>
		</div>
	);
}

interface ComparisonRowProps {
	field: SetupDiffField;
	setupAName: string;
	setupBName: string;
	onApply?: (field: SetupDiffField, value: unknown) => void;
}

function ComparisonRow(props: ComparisonRowProps) {
	const isIncrease = (val: unknown): boolean => {
		if (typeof val === "number" && typeof props.field.oldValue === "number") {
			return val > props.field.oldValue;
		}
		return false;
	};

	return (
		<div class={`px-3 py-2 ${props.field.hasDifference ? "" : "opacity-50"}`}>
			<div class="flex items-center justify-between mb-1">
				<span class="text-xs text-foreground">{props.field.label}</span>
				<div class="flex items-center gap-1">
					<div
						class="w-1.5 h-1.5"
						style={{ "background-color": getImpactColor(props.field.impact) }}
						title={`${props.field.impact} impact`}
					/>
					<span class="text-[10px] text-muted uppercase">
						{props.field.impact}
					</span>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex items-center gap-2">
					<div class="flex-1 text-right">
						<span class="text-xs font-mono text-muted">
							{props.field.formattedOld}
						</span>
					</div>
					<Show
						when={props.field.hasDifference && props.field.impact === "high"}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-red-500 shrink-0"
						>
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</Show>
				</div>
				<div class="flex items-center gap-2">
					<Show
						when={props.field.hasDifference && props.field.impact === "high"}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-green-500 shrink-0"
						>
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</Show>
					<div class="flex-1 text-left">
						<span
							class={`text-xs font-mono ${props.field.hasDifference ? "text-foreground" : "text-muted"}`}
						>
							{props.field.formattedNew}
						</span>
					</div>
					<Show when={props.onApply && props.field.hasDifference}>
						<button
							type="button"
							class="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground hover:bg-foreground/20 transition-colors"
							onClick={() => props.onApply?.(props.field, props.field.newValue)}
						>
							Apply
						</button>
					</Show>
					<Show when={props.onApply && !props.field.hasDifference}>
						<span class="text-[10px] text-muted uppercase tracking-wider">
							Same
						</span>
					</Show>
				</div>
			</div>
		</div>
	);
}
