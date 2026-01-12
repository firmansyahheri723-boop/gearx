import { HelpTooltip } from "@/components/ui/help-tooltip";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { AlignmentOutputs } from "@/types";

type Props = { outputs: AlignmentOutputs };

export function AckermannVizSection(props: Props) {
	return (
		<div class="border border-border/50 bg-background/50">
			<SectionHeader
				title="Ackermann Geometry"
				variant="output"
				help={{
					description:
						"Visualization of inner and outer wheel angles at maximum steering lock. The relationship affects tire scrub and steering feel.",
					formula: "\\cot(\\alpha_O) - \\cot(\\alpha_I) = \\frac{L}{E}",
					variables: [
						"α_O = outer wheel angle",
						"α_I = inner wheel angle",
						"L = wheelbase",
					],
				}}
			/>
			<div class="p-4">
				<div class="grid grid-cols-3 gap-4">
					<MetricCard
						label="Inner Wheel"
						value={props.outputs.innerWheelAngle.toFixed(1)}
						unit="deg"
					/>
					<MetricCard
						label="Outer Wheel"
						value={props.outputs.outerWheelAngle.toFixed(1)}
						unit="deg"
					/>
					<MetricCard
						label="Scrub Radius Est."
						value={props.outputs.scrubRadiusEstimate.toFixed(2)}
						unit="cm"
					/>
				</div>

				<div class="mt-4 p-3 bg-surface/30 border border-border/50">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-xs uppercase tracking-wider text-muted">
							Ackermann Type Guide
						</span>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
							<span class="text-foreground-secondary">
								Positive: Easier to drive, some scrub
							</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-blue-500"></span>
							<span class="text-foreground-secondary">
								Parallel: Maximum lock, harder to control
							</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-amber-500"></span>
							<span class="text-foreground-secondary">
								Reverse: Rarely used, specific drift styles
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
