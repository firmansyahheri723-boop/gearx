import { Component, Show } from "solid-js";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { SectionHeader } from "@/components/ui/section-header";
import type { AeroExperimentalOutput } from "@/types";
import { AeroChart } from "./aero-chart";

interface AeroExperimentalSectionProps {
	output: AeroExperimentalOutput;
}

export function AeroExperimentalSection(props: AeroExperimentalSectionProps) {
	return (
		<div class="border border-border/50 bg-background/50">
			<div class="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-amber-500/10">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-4 bg-amber-500" />
					<span class="font-semibold tracking-wider text-xs uppercase text-foreground">
						Experimental Physics
					</span>
					<HelpTooltip description="Estimated values based on real-world aerodynamics formulas. Uses car-specific data (frontal area, drag coefficient) when available. Actual game values may differ." />
				</div>
				<span class="px-2 py-0.5 text-[10px] font-bold tracking-wider border bg-orange-500/20 text-orange-400 border-orange-500/30">
					EXPERIMENTAL
				</span>
			</div>

			<div class="p-4 space-y-4">
				<div class="p-3 bg-amber-500/10 border border-amber-500/30">
					<p class="text-xs text-amber-500/90">
						These are <span class="font-medium">estimated values</span> based on
						simplified aerodynamic formulas. Results may not match actual game
						physics. Use for comparative analysis only.
					</p>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-xl font-semibold text-emerald-500">
							{props.output.totalDownforceN} N
						</div>
						<div class="text-xs text-foreground-secondary">Total Downforce</div>
						<div class="text-[10px] text-muted">
							@ {props.output.referenceSpeedKmh} km/h
						</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-blue-500">
							{props.output.frontDownforceN} N
						</div>
						<div class="text-xs text-foreground-secondary">Front Downforce</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-violet-500">
							{props.output.rearDownforceN} N
						</div>
						<div class="text-xs text-foreground-secondary">Rear Downforce</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-red-500">
							{props.output.dragForceN} N
						</div>
						<div class="text-xs text-foreground-secondary">Drag Force</div>
					</div>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-amber-500">
							{props.output.powerLossKw} kW
						</div>
						<div class="text-xs text-foreground-secondary">Power Loss</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-orange-500">
							-{props.output.topSpeedReductionKmh} km/h
						</div>
						<div class="text-xs text-foreground-secondary">Top Speed Est.</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-cyan-500">
							+{props.output.corneringGIncrease} G
						</div>
						<div class="text-xs text-foreground-secondary">Cornering Grip</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-teal-500">
							+{props.output.effectiveLoadIncreaseKg} kg
						</div>
						<div class="text-xs text-foreground-secondary">Tire Load</div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-emerald-500">
							+{props.output.tractionLimitIncreasePct}%
						</div>
						<div class="text-xs text-foreground-secondary">Traction Limit</div>
					</div>
					<div class="bg-surface/50 p-3 text-center">
						<div class="text-lg font-semibold text-blue-500">
							~{props.output.maxSpeedKmh} km/h
						</div>
						<div class="text-xs text-foreground-secondary">Est. Max Speed</div>
					</div>
				</div>

				<div class="space-y-2">
					<div class="text-xs uppercase tracking-wide text-foreground-secondary">
						Downforce vs Speed
					</div>
					<AeroChart
						speedData={props.output.speedData}
						maxSpeedKmh={props.output.maxSpeedKmh}
						height={300}
					/>
				</div>
			</div>
		</div>
	);
}
