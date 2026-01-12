import { SectionHeader } from "@/components/ui/section-header";
import { MetricCardWithHelp } from "@/components/ui/metric-card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { SuspensionOutputs } from "../suspension";
import { ARB_STIFFNESS_HELP } from "../suspension-constants";

type Props = {
  outputs: SuspensionOutputs;
};

export function AntiRollBarsSection(props: Props) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Anti-Roll Bars"
        variant="output"
        help={{
          description:
            "Anti-roll bars resist body roll during cornering. FARB (Front) and RARB (Rear) stiffness determines handling balance - more front ARB causes understeer, more rear ARB causes oversteer.",
          formula: "K_{\\phi DES} = \\frac{W \\cdot H}{\\phi / A_y}",
          variables: [
            "K_φDES = desired roll rate (Nm/deg)",
            "W = vehicle weight (kg)",
            "H = roll center to CoG height (m)",
            "φ/Ay = desired roll gradient (deg/g)",
          ],
          position: "bottom",
          articles: [
            {
              label: "Wikipedia: Anti-roll Bar",
              url: "https://en.wikipedia.org/wiki/Anti-roll_bar",
            },
          ],
          videos: [
            {
              label: "Anti-Roll Bars Guide",
              url: "https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY",
            },
          ],
        }}
      />
      <div class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <MetricCardWithHelp
            label="FARB"
            value={props.outputs.antiRollBars.farb.toFixed(2)}
            unit="kNm"
            highlight
            help={ARB_STIFFNESS_HELP}
          />
          <MetricCardWithHelp
            label="RARB"
            value={props.outputs.antiRollBars.rarb.toFixed(2)}
            unit="kNm"
            highlight
            help={ARB_STIFFNESS_HELP}
          />
        </div>
        <div class="border-t border-border/50 pt-4 space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="text-muted">Roll Center to CoG</span>
            <span class="text-foreground">
              {(props.outputs.antiRollBars.rollCenterToCoG * 100).toFixed(1)} cm
            </span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-1">
              <span class="text-muted">Total Roll Rate</span>
              <HelpTooltip
                description="Total roll rate combines spring, tire, and ARB contributions. This complex formula accounts for tire compliance and wheel rates."
                formula="K_{\phi A} = \frac{\frac{\pi}{180} \cdot K_{\phi DES} \cdot K_t \cdot \frac{t^2}{2}}{K_t \cdot \frac{t^2}{2} \cdot \frac{\pi}{180} - K_{\phi DES}} - \frac{\pi \cdot K_w \cdot \frac{t^2}{2}}{180}"
                variables={[
                  "K_φA = total roll rate (Nm/deg)",
                  "K_t = tire rate (N/m)",
                  "K_w = average wheel rate (N/m)",
                  "t = average track width (m)",
                ]}
                position="left"
              />
            </div>
            <span class="text-foreground">
              {props.outputs.antiRollBars.totalRollRate.toFixed(0)} Nm/deg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
