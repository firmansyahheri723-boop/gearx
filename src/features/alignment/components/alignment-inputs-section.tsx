import { For } from "solid-js";
import { SectionHeader } from "../../../components/ui/section-header";
import { SliderRow } from "../../../components/ui/slider-row";
import { SegmentedRow } from "../../../components/ui/segmented-row";
import {
  alignmentInputs,
  setAlignmentInputs,
  applyAlignmentPreset,
} from "../../alignment/store";
import {
  ALIGNMENT_SLIDERS,
  ALIGNMENT_PRESETS,
} from "./alignment-tab-constants";

export function AlignmentInputsSection() {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Alignment Settings"
        variant="input"
        help={{
          description:
            "Wheel alignment parameters that affect handling balance. Camber, caster, toe, and Ackermann work together to determine turn-in response, straight-line stability, and tire wear.",
          position: "bottom",
          articles: [
            {
              label: "Wikipedia: Camber Angle",
              url: "https://en.wikipedia.org/wiki/Camber_angle",
            },
            {
              label: "Wikipedia: Ackermann Steering",
              url: "https://en.wikipedia.org/wiki/Ackermann_steering_geometry",
            },
          ],
        }}
      />
      <div class="p-4 space-y-4">
        <SegmentedRow
          label="Preset"
          options={ALIGNMENT_PRESETS}
          value=""
          onChange={(value) => applyAlignmentPreset(value as string)}
        />
        <For each={ALIGNMENT_SLIDERS}>
          {(slider) => (
            <SliderRow
              label={slider.label}
              help={slider.help}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={alignmentInputs[slider.key] as number}
              onChange={(val) => setAlignmentInputs(slider.key, val)}
              unit={slider.unit}
              info={slider.description}
            />
          )}
        </For>
      </div>
    </div>
  );
}
