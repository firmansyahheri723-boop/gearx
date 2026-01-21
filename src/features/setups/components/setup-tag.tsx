import type { SetupTag as SetupTagType } from "@/features/setups/types";

interface SetupTagDisplayProps {
	tag: SetupTagType;
	removable?: boolean;
	onRemove?: () => void;
	onClick?: () => void;
	class?: string;
}

export function SetupTag(props: SetupTagDisplayProps) {
	return (
		<span
			class={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider transition-all ${
				props.class ?? ""
			}`}
			style={{
				"background-color": `${props.tag.color}20`,
				border: `1px solid ${props.tag.color}40`,
				color: props.tag.color,
			}}
			onClick={props.onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					props.onClick?.();
				}
			}}
			role="button"
			tabIndex={0}
		>
			<span class="truncate max-w-[100px]">{props.tag.name}</span>
			{props.removable && (
				<button
					type="button"
					class="flex items-center justify-center w-3 h-3 hover:bg-black/10 transition-colors"
					onClick={(e) => {
						e.stopPropagation();
						props.onRemove?.();
					}}
					title="Remove tag"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
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
			)}
		</span>
	);
}
