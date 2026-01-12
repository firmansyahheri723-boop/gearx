import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { SuspensionOutputs } from "../utils/suspension";

type Props = {
  outputs: SuspensionOutputs;
};

export function SpringsStiffnessSection(props: Props) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Springs Stiffness"
        variant="output"
        help={{
          description:
            "Spring stiffness calculated from ride frequency and sprung mass per corner. Higher values mean stiffer springs with less body roll but harsher ride.",
          formula: "K = 4 \\pi^2 f^2 m",
          variables: [
            "K = spring stiffness (N/m)",
            "f = ride frequency (Hz)",
            "m = sprung mass per corner (kg)",
          ],
          position: "bottom",
          articles: [
            {
              label: "Wikipedia: Spring Rate",
              url: "https://en.wikipedia.org/wiki/Spring_(device)#Spring_rate",
            },
          ],
          videos: [
            {
              label: "Springs & Dampers Guide",
              url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc",
            },
          ],
        }}
      />
      <div class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <MetricCard
            label="Front Springs"
            value={(props.outputs.springs.frontStiffness / 1000).toFixed(2)}
            unit="kN/m"
            highlight
          />
          <MetricCard
            label="Rear Springs"
            value={(props.outputs.springs.rearStiffness / 1000).toFixed(2)}
            unit="kN/m"
            highlight
          />
        </div>
        <div class="border-t border-border/50 pt-4">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-[10px] uppercase tracking-wider text-muted">
              Sprung Masses (per corner)
            </span>
            <HelpTooltip
              description="Sprung mass is the portion of the vehicle supported by the suspension. Calculated per corner by taking half the axle weight minus the wheel weight (unsprung mass)."
              formula="m_{sprung} = \frac{W_{axle}}{2} - W_{wheel}"
              variables={[
                "m_sprung = sprung mass per corner (kg)",
                "W_axle = axle weight (kg)",
                "W_wheel = wheel weight (kg)",
              ]}
              position="bottom"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-lg font-bold text-foreground">
                {props.outputs.springs.frontSprungMass.toFixed(1)}
              </div>
              <div class="text-[10px] text-muted">Front kg</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-foreground">
                {props.outputs.springs.rearSprungMass.toFixed(1)}
              </div>
              <div class="text-[10px] text-muted">Rear kg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
