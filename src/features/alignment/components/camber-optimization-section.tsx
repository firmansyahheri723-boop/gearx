import { For } from "solid-js";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { AlignmentOutputs } from "@/types";

type Props = { outputs: AlignmentOutputs };

export function CamberOptimizationSection(props: Props) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Camber Analysis"
        variant="output"
        help={{
          description:
            "Camber angle through steering range affects tire contact patch and grip. Excessive camber gain can cause inner tire wear.",
          formula: "\\Delta\\theta = \\delta \\cdot \\sin(\\theta_{camber})",
          variables: [
            "Δθ = camber gain (deg)",
            "δ = steering angle (deg)",
            "θ = static camber",
          ],
          position: "bottom",
        }}
      />
      <div class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Front Camber Gain"
            value={props.outputs.frontCamberGain.toFixed(1)}
            unit="deg"
          />
          <MetricCard
            label="Rear Camber Gain"
            value={props.outputs.rearCamberGain.toFixed(1)}
            unit="deg"
          />
          <MetricCard
            label="Front Contact"
            value={props.outputs.contactPatchFront.toFixed(0)}
            unit="%"
          />
          <MetricCard
            label="Rear Contact"
            value={props.outputs.contactPatchRear.toFixed(0)}
            unit="%"
          />
        </div>

        <div class="mt-4 p-3 bg-surface/30 border border-border/50">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs uppercase tracking-wider text-muted">
              Tire Wear Warning
            </span>
            <HelpTooltip
              description="At high steering angles, camber becomes more negative. This reduces contact patch on the inner edge of the tire."
              formula="CP_{dynamic} = CP_{static} \cdot \cos(\theta + \Delta\theta)"
              position="right"
            />
          </div>
          <p class="text-sm text-foreground-secondary">
            {props.outputs.frontCamberGain > 8
              ? "High front camber gain - expect inner tire wear"
              : "Front camber gain within normal range"}
          </p>
        </div>
      </div>
    </div>
  );
}
