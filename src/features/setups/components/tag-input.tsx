import type { SetupTag, SetupTagColor } from "@/features/setups/types";

interface TagInputStandaloneProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	colors: SetupTagColor[];
	selectedColor: SetupTagColor;
	onColorSelect: (color: SetupTagColor) => void;
	existingTags?: SetupTag[];
}

export function TagInput(props: TagInputStandaloneProps) {
	const suggestedTags = [
		"grip",
		"drift",
		"drag",
		"street",
		"track",
		"race",
		"sport",
		"tune",
	];

	return (
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<input
					type="text"
					value={props.value}
					onInput={(e) => props.onChange(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							props.onSubmit();
						}
					}}
					placeholder="Tag name"
					class="flex-1 bg-surface-elevated/50 border border-border/50 px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/50"
				/>
				<div class="flex gap-0.5">
					{props.colors.slice(0, 8).map((color) => (
						<button
							type="button"
							class={`w-5 h-5 border ${
								props.selectedColor === color
									? "border-foreground"
									: "border-transparent"
							}`}
							style={{ "background-color": color }}
							onClick={() => props.onColorSelect(color)}
						/>
					))}
				</div>
				<button
					type="button"
					onClick={props.onSubmit}
					class="px-3 py-1.5 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider"
				>
					Add
				</button>
			</div>
			{props.value && (
				<div class="flex flex-wrap gap-1">
					{suggestedTags
						.filter((t) => t.toLowerCase().includes(props.value.toLowerCase()))
						.slice(0, 5)
						.map((tag) => (
							<button
								type="button"
								class="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-surface-elevated/50 border border-border/30 text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
								onClick={() => props.onChange(tag)}
							>
								{tag}
							</button>
						))}
				</div>
			)}
		</div>
	);
}
