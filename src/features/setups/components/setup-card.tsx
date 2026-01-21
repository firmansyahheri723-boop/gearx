import { For } from "solid-js";
import type { SavedSetup } from "@/features/setups/types";
import { SetupTag as SetupTagComponent } from "./setup-tag";

interface SetupCardProps {
	setup: SavedSetup;
	selected?: boolean;
	onClick: () => void;
	onApply: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
}

export function SetupCard(props: SetupCardProps) {
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div
			class={`border transition-all cursor-pointer ${
				props.selected
					? "border-foreground/50 bg-surface-elevated/30"
					: "border-border/50 bg-surface/50 hover:border-foreground/30 hover:bg-surface-elevated/20"
			}`}
			onClick={props.onClick}
		>
			<div class="p-3 border-b border-border/30">
				<div class="flex items-start justify-between gap-2">
					<div class="flex-1 min-w-0">
						<h3 class="text-sm font-bold uppercase tracking-wider text-foreground truncate">
							{props.setup.name}
						</h3>
						<p class="text-[10px] text-muted mt-0.5 truncate">
							{props.setup.carName}
						</p>
					</div>
					<div class="flex items-center gap-1 shrink-0">
						<button
							type="button"
							class="p-1.5 text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								props.onApply();
							}}
							title="Apply setup"
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
							>
								<path d="M12 5v14M5 12h14" />
							</svg>
						</button>
						<button
							type="button"
							class="p-1.5 text-muted hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								props.onEdit();
							}}
							title="Edit"
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
							>
								<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div class="p-3 space-y-2">
				<div class="flex items-center gap-1 flex-wrap min-h-[24px]">
					<For each={props.setup.tags.slice(0, 3)}>
						{(tag) => <SetupTagComponent tag={tag} />}
					</For>
					{props.setup.tags.length > 3 && (
						<span class="text-[10px] text-muted">
							+{props.setup.tags.length - 3}
						</span>
					)}
				</div>

				{props.setup.description && (
					<p class="text-xs text-muted line-clamp-2">
						{props.setup.description}
					</p>
				)}

				<div class="flex items-center justify-between text-[10px] text-muted pt-1">
					<span>{formatDate(props.setup.updatedAt)}</span>
					<div class="flex items-center gap-1">
						<button
							type="button"
							class="hover:text-foreground transition-colors cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								props.onDuplicate();
							}}
							title="Duplicate"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="8" y="8" width="12" height="12" rx="2" />
								<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
							</svg>
						</button>
						<button
							type="button"
							class="hover:text-red-500 transition-colors cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								props.onDelete();
							}}
							title="Delete"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
