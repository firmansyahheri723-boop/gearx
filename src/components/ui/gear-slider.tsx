import {
	SliderControl,
	SliderRange,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	type SliderValueChangeDetails,
} from "@ark-ui/solid/slider";
import { createSignal, Show } from "solid-js";
import { FINAL_DRIVE_COLOR, GEAR_COLORS } from "@/constants/colors";
import type { GearRatio } from "@/features/gearbox/types";
import { NumberInput } from "./number-input";

type GearSliderProps = {
	gear: GearRatio;
	label: string;
	index: number;
	gap: number | null;
	isFinalDrive?: boolean;
	onRatioChange: (value: number) => void;
	onMinChange: (value: number) => void;
	onMaxChange: (value: number) => void;
};

export function GearSlider(props: GearSliderProps) {
	const [isEditing, setIsEditing] = createSignal(false);

	const gearColor = () => {
		if (props.isFinalDrive) return FINAL_DRIVE_COLOR;
		return GEAR_COLORS[props.index % GEAR_COLORS.length];
	};

	const handleSliderChange = (details: SliderValueChangeDetails) => {
		props.onRatioChange(details.value[0]);
	};

	return (
		<tr class="group border-b border-border/30 last:border-b-0">
			<td
				class="px-3 py-2.5 bg-surface/50 text-xs uppercase tracking-wide text-center w-20 border-r border-border/50"
				style={{ color: gearColor() }}
			>
				<div class="flex items-center justify-center gap-1.5">
					<span
						class="w-2 h-2 rounded-full"
						style={{ background: gearColor() }}
					/>
					{props.label}
				</div>
			</td>
			<td class="px-4 py-2.5 bg-surface/30 border-r border-border/50">
				<div class="flex items-center gap-3">
					{/* Min value */}
					<div class="w-12 shrink-0">
						<Show
							when={isEditing()}
							fallback={
								<button
									type="button"
									class="text-muted text-xs hover:text-foreground-secondary transition-colors bg-transparent border-none p-0 cursor-pointer w-full text-left"
									onClick={() => setIsEditing(true)}
								>
									{props.gear.min.toFixed(1)}
								</button>
							}
						>
							<NumberInput
								value={props.gear.min}
								onChange={(val) => props.onMinChange(val)}
								onBlur={() => setIsEditing(false)}
								step={0.1}
								class="w-full px-1.5 py-0.5 bg-surface-elevated text-xs border border-border focus:outline-none"
								style={{
									color: gearColor(),
									"border-color": `${gearColor()}80`,
								}}
							/>
						</Show>
					</div>

					{/* Slider track */}
					<div class="flex-1 relative h-6 flex items-center">
						<SliderRoot
							value={[props.gear.ratio]}
							onValueChange={handleSliderChange}
							min={props.gear.min}
							max={props.gear.max}
							step={0.01}
							class="absolute inset-0 w-full h-6"
						>
							<SliderControl>
								<SliderTrack class="absolute inset-x-0 h-1 bg-surface-elevated rounded-full">
									<SliderRange
										class="absolute left-0 top-0 h-full rounded-full"
										style={{
											background: `linear-gradient(to right, ${gearColor()}99, ${gearColor()})`,
										}}
									/>
								</SliderTrack>
								<SliderThumb
									index={0}
									class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 cursor-pointer"
									style={{
										background: gearColor(),
										"border-color": `${gearColor()}cc`,
										"box-shadow": `0 0 8px ${gearColor()}50`,
									}}
								/>
							</SliderControl>
						</SliderRoot>
					</div>

					{/* Max value */}
					<div class="w-12 shrink-0 text-right">
						<Show
							when={isEditing()}
							fallback={
								<button
									type="button"
									class="text-muted text-xs hover:text-foreground-secondary transition-colors bg-transparent border-none p-0 cursor-pointer w-full text-right"
									onClick={() => setIsEditing(true)}
								>
									{props.gear.max.toFixed(1)}
								</button>
							}
						>
							<NumberInput
								value={props.gear.max}
								onChange={(val) => props.onMaxChange(val)}
								onBlur={() => setIsEditing(false)}
								step={0.1}
								class="w-full px-1.5 py-0.5 bg-surface-elevated text-xs border border-border focus:outline-none"
								style={{
									color: gearColor(),
									"border-color": `${gearColor()}80`,
								}}
							/>
						</Show>
					</div>
				</div>
			</td>
			<td class="px-3 py-2.5 bg-surface/30 w-24 border-r border-border/50">
				<NumberInput
					value={props.gear.ratio}
					onChange={(val) => props.onRatioChange(val)}
					step={0.01}
					class="w-full bg-transparent text-center focus:outline-none font-medium"
					style={{ color: gearColor() }}
				/>
			</td>
			<td class="px-2 py-2.5 bg-surface/30 w-16 text-center">
				<Show
					when={props.gap !== null}
					fallback={<span class="text-muted">—</span>}
				>
					<span class="text-foreground-secondary">{props.gap!.toFixed(2)}</span>
				</Show>
			</td>
		</tr>
	);
}
