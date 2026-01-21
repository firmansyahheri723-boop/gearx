import {
	SliderControl,
	SliderRange,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	type SliderValueChangeDetails,
} from "@ark-ui/solid/slider";
import { Component, splitProps } from "solid-js";
import type { HelpLink } from "@/components/ui/help-tooltip";
import { HelpTooltip } from "./help-tooltip";

export type SliderRowProps = {
	label: string;
	description?: string;
	articles?: HelpLink[];
	videos?: HelpLink[];
	help?: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onChange: (value: number) => void;
	unit: string;
	info?: string;
};

export function SliderRow(props: SliderRowProps) {
	const [local] = splitProps(props, [
		"label",
		"description",
		"articles",
		"videos",
		"help",
		"min",
		"max",
		"step",
		"value",
		"onChange",
		"unit",
		"info",
	]);

	const decimals = local.step < 1 ? (local.step < 0.1 ? 2 : 1) : 0;

	return (
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					<span class="text-xs text-foreground-secondary">{local.label}</span>
					{local.help && (
						<HelpTooltip description={local.help} position="right" />
					)}
				</div>
				<div class="flex items-baseline gap-1">
					<span class="text-sm font-bold text-foreground-secondary">
						{local.value.toFixed(decimals)}
					</span>
					<span class="text-[10px] text-muted">{local.unit}</span>
				</div>
			</div>
			<SliderRoot
				value={[local.value]}
				onValueChange={(details: SliderValueChangeDetails) =>
					local.onChange(details.value[0])
				}
				min={local.min}
				max={local.max}
				step={local.step}
				aria-label={[local.label]}
				class="relative w-full h-5 flex items-center"
			>
				<SliderControl>
					<SliderTrack class="relative w-full h-1.5 bg-border rounded">
						<SliderRange class="absolute h-full bg-muted rounded" />
					</SliderTrack>
					<SliderThumb
						index={0}
						class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-foreground-secondary rounded-full shadow-lg shadow-foreground/30 border border-foreground cursor-pointer"
					/>
				</SliderControl>
			</SliderRoot>
			{local.info && <div class="text-[10px] text-muted">{local.info}</div>}
		</div>
	);
}
