import { Show } from "solid-js";
import type { HelpLink } from "@/types";
import { HelpTooltip, type TooltipPosition } from "./help-tooltip";

type SectionHeaderProps = {
	title: string;
	variant?: "input" | "output";
	help?: {
		description: string;
		formula?: string;
		variables?: string[];
		articles?: HelpLink[];
		videos?: HelpLink[];
		position?: TooltipPosition;
	};
};

export function SectionHeader(props: SectionHeaderProps) {
	const isOutput = () => props.variant === "output";

	return (
		<div
			class="flex items-center justify-between px-3 py-2 border-b"
			classList={{
				"bg-surface/80 border-border/50": true,
			}}
		>
			<div class="flex items-center gap-3">
				<div
					class="w-1.5 h-4"
					classList={{
						"bg-muted": !isOutput(),
						"bg-amber-500": isOutput(),
					}}
				/>
				<span
					class="font-semibold tracking-wider text-xs uppercase"
					classList={{
						"text-foreground": true,
					}}
				>
					{props.title}
				</span>
				<Show when={props.help}>
					<HelpTooltip
						description={props.help!.description}
						formula={props.help!.formula}
						variables={props.help!.variables}
						articles={props.help!.articles}
						videos={props.help!.videos}
						position={props.help!.position}
					/>
				</Show>
			</div>
			<Show when={props.variant}>
				<span
					class="px-2 py-0.5 text-[10px] font-bold tracking-wider border"
					classList={{
						"bg-orange-500/20 text-orange-400 border-orange-500/30": isOutput(),
						"bg-blue-500/20 text-blue-400 border-blue-500/30": !isOutput(),
					}}
				>
					{isOutput() ? "OUTPUT" : "INPUT"}
				</span>
			</Show>
		</div>
	);
}
