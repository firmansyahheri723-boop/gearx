import { createSignal, For, Show } from "solid-js";
import { vehicleInputs } from "@/features/suspension/store";
import type { SetupTag, SetupTagColor } from "@/types";
import { SETUP_TAG_COLORS } from "@/types";
import { createSetup, getAllTags, updateSetup } from "../store";
import {
	finalDrive,
	gearRatios,
	tireCompound,
	tractionMode,
	torqueRpmData,
} from "@/features/gearbox/store";
import { alignmentInputs } from "@/features/alignment/store";
import { aeroSettings } from "@/features/aero/store";

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface SetupSaveDialogProps {
	setup?: {
		id: string;
		name: string;
		description: string;
		tags: SetupTag[];
		notes: string;
	};
	onClose: () => void;
	onSave: () => void;
}

export function SetupSaveDialog(props: SetupSaveDialogProps) {
	const [name, setName] = createSignal(props.setup?.name ?? "");
	const [description, setDescription] = createSignal(
		props.setup?.description ?? "",
	);
	const [notes, setNotes] = createSignal(props.setup?.notes ?? "");
	const [tags, setTags] = createSignal<SetupTag[]>(props.setup?.tags ?? []);
	const [tagInput, setTagInput] = createSignal("");
	const [selectedColor, setSelectedColor] = createSignal<SetupTagColor>(
		SETUP_TAG_COLORS[0],
	);
	const [saving, setSaving] = createSignal(false);
	const [error, setError] = createSignal("");

	const existingTags = getAllTags();

	const handleAddTag = () => {
		const value = tagInput().trim();
		if (!value) return;

		const newTag: SetupTag = {
			id: generateId(),
			name: value,
			color: selectedColor(),
		};

		setTags([...tags(), newTag]);
		setTagInput("");
	};

	const handleRemoveTag = (tagId: string) => {
		setTags(tags().filter((t) => t.id !== tagId));
	};

	const handleSubmit = async () => {
		if (!name().trim()) {
			setError("Name is required");
			return;
		}

		setSaving(true);
		setError("");

		try {
			if (props.setup?.id) {
				updateSetup(props.setup.id, {
					name: name().trim(),
					description: description().trim(),
					notes: notes().trim(),
					tags: tags(),
				});
			} else {
				const torqueRpmData =
					(window as unknown as { torqueRpmData?: unknown[] }).torqueRpmData ??
					[];
				const gearRatios =
					(window as unknown as { gearRatios?: unknown[] }).gearRatios ?? [];
				const finalDrive = (window as unknown as { finalDrive?: unknown })
					.finalDrive ?? { ratio: 3.0, min: 2.0, max: 5.0 };
				const tireCompound =
					(window as unknown as { tireCompound?: string }).tireCompound ??
					"racing";
				const tractionMode =
					(window as unknown as { tractionMode?: string }).tractionMode ??
					"launch";
				const aeroSettings = (window as unknown as { aeroSettings?: unknown })
					.aeroSettings ?? { frontAero: 10, rearAero: 5, airResistance: 0 };
				const alignmentInputs = (
					window as unknown as { alignmentInputs?: unknown }
				).alignmentInputs;

				createSetup({
					name: name().trim(),
					description: description().trim(),
					tags: tags(),
					notes: notes().trim(),
					carName: vehicleInputs.carSelection,
					inputs: { ...vehicleInputs },
					torqueRpmData: [...torqueRpmData],
					gearRatios: [...gearRatios],
					finalDrive: { ...finalDrive },
					tireCompound: tireCompound.value,
					tractionMode: tractionMode.value,
					aeroSettings: { ...aeroSettings },
					alignmentInputs: { ...alignmentInputs },
				});
			}

			props.onSave();
			props.onClose();
		} catch {
			setError("Failed to save setup");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={props.onClose}
			/>
			<div class="relative bg-surface/95 border border-border/50 shadow-2xl shadow-black/40 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-surface/95">
					<h2 class="text-sm font-bold uppercase tracking-widest text-foreground">
						{props.setup ? "Edit Setup" : "Save Setup"}
					</h2>
					<button
						onClick={props.onClose}
						class="p-1 text-muted hover:text-foreground transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>

				<div class="p-4 space-y-4">
					<Show when={error()}>
						<div class="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
							{error()}
						</div>
					</Show>

					<div>
						<label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
							Name *
						</label>
						<input
							type="text"
							value={name()}
							onInput={(e) => setName(e.currentTarget.value)}
							placeholder="My Race Setup"
							class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
						/>
					</div>

					<div>
						<label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
							Description
						</label>
						<input
							type="text"
							value={description()}
							onInput={(e) => setDescription(e.currentTarget.value)}
							placeholder="Short description"
							class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
						/>
					</div>

					<div>
						<label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
							Tags
						</label>
						<div class="flex flex-wrap gap-1.5 mb-2">
							<For each={tags()}>
								{(tag) => (
									<span
										class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider"
										style={{
											"background-color": `${tag.color}20`,
											border: `1px solid ${tag.color}40`,
											color: tag.color,
										}}
									>
										{tag.name}
										<button
											type="button"
											class="ml-1 hover:text-foreground"
											onClick={() => handleRemoveTag(tag.id)}
										>
											×
										</button>
									</span>
								)}
							</For>
						</div>
						<div class="flex items-center gap-2">
							<input
								type="text"
								value={tagInput()}
								onInput={(e) => setTagInput(e.currentTarget.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleAddTag();
									}
								}}
								placeholder="Add tag"
								class="flex-1 bg-surface-elevated/50 border border-border/50 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/50"
							/>
							<div class="flex gap-0.5">
								<For each={SETUP_TAG_COLORS.slice(0, 8)}>
									{(color) => (
										<button
											type="button"
											class={`w-5 h-5 border ${
												selectedColor() === color
													? "border-foreground"
													: "border-transparent"
											}`}
											style={{ "background-color": color }}
											onClick={() => setSelectedColor(color)}
										/>
									)}
								</For>
							</div>
							<button
								type="button"
								onClick={handleAddTag}
								class="px-3 py-2 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider"
							>
								Add
							</button>
						</div>
					</div>

					<div>
						<label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
							Notes
						</label>
						<textarea
							value={notes()}
							onInput={(e) => setNotes(e.currentTarget.value)}
							placeholder="Additional notes about this setup..."
							rows={3}
							class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50 resize-none"
						/>
					</div>

					<div class="pt-2 flex gap-2">
						<button
							type="button"
							onClick={props.onClose}
							class="flex-1 px-4 py-2 border border-border/50 text-muted hover:text-foreground text-xs uppercase tracking-wider transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={saving() || !name().trim()}
							class="flex-1 px-4 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary transition-colors disabled:opacity-50"
						>
							{saving() ? "Saving..." : "Save"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
