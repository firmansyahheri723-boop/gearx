import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { ComparisonView } from "@/features/setups/components/comparison-view";
import { SetupList } from "@/features/setups/components/setup-list";
import { SetupMerger } from "@/features/setups/components/setup-merger";
import { SetupSaveDialog } from "@/features/setups/components/setup-save-dialog";
import type { SavedSetup } from "@/features/setups/types";
import { applySavedSetupToVehicle } from "@/features/suspension/store";

export const Route = createFileRoute("/setups")({
	component: SetupsPage,
});

type ViewMode = "list" | "compare" | "merge";

function SetupsPage() {
	const [viewMode, setViewMode] = createSignal<ViewMode>("list");
	const [showSaveDialog, setShowSaveDialog] = createSignal(false);
	const [showMerger, setShowMerger] = createSignal(false);
	const [notification, setNotification] = createSignal<string | null>(null);

	const handleApplySetup = (setup: SavedSetup) => {
		applySavedSetupToVehicle(setup);
		setNotification(`Applied "${setup.name}"`);
		setTimeout(() => setNotification(null), 3000);
	};

	const showNotification = (message: string) => {
		setNotification(message);
		setTimeout(() => setNotification(null), 3000);
	};

	return (
		<div class="space-y-4">
			<Show when={notification()}>
				<div class="fixed bottom-4 right-4 z-50 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg">
					{notification()}
				</div>
			</Show>

			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					<button
						type="button"
						onClick={() => setViewMode("list")}
						class={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
							viewMode() === "list"
								? "bg-foreground text-background border-foreground"
								: "border-border/50 text-muted hover:text-foreground"
						}`}
					>
						All Setups
					</button>
					<button
						type="button"
						onClick={() => setViewMode("compare")}
						class={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
							viewMode() === "compare"
								? "bg-foreground text-background border-foreground"
								: "border-border/50 text-muted hover:text-foreground"
						}`}
					>
						Compare
					</button>
					<button
						type="button"
						onClick={() => setViewMode("merge")}
						class={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
							viewMode() === "merge"
								? "bg-foreground text-background border-foreground"
								: "border-border/50 text-muted hover:text-foreground"
						}`}
					>
						Merge
					</button>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onClick={() => setShowMerger(true)}
						class="px-3 py-1.5 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider"
					>
						New from Merge
					</button>
					<button
						type="button"
						onClick={() => setShowSaveDialog(true)}
						class="px-3 py-1.5 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary"
					>
						Save Current
					</button>
				</div>
			</div>

			<Show when={viewMode() === "list"}>
				<SetupList onApplySetup={handleApplySetup} />
			</Show>

			<Show when={viewMode() === "compare"}>
				<ComparisonView
					onApplyValue={(path, value) => {
						console.log("Apply value:", path, value);
						showNotification(`Would apply ${path}: ${value}`);
					}}
				/>
			</Show>

			<Show when={viewMode() === "merge"}>
				<div class="text-center py-8 text-muted text-sm">
					<p class="mb-2">Select two setups to merge their settings</p>
					<button
						type="button"
						onClick={() => setShowMerger(true)}
						class="px-4 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary"
					>
						Open Merger
					</button>
				</div>
			</Show>

			<Show when={showSaveDialog()}>
				<SetupSaveDialog
					onClose={() => setShowSaveDialog(false)}
					onSave={() => showNotification("Setup saved successfully")}
				/>
			</Show>

			<Show when={showMerger()}>
				<SetupMerger
					onClose={() => setShowMerger(false)}
					onCreated={() => {
						setViewMode("list");
						showNotification("Merged setup created");
					}}
				/>
			</Show>
		</div>
	);
}
