import { For } from "solid-js";
import { SectionHeader } from "@/components/ui/section-header";
import { NumberInput } from "@/components/ui/number-input";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { DrivetrainViz } from "@/components/ui/drivetrain-viz";
import {
  DRIVETRAIN_OPTIONS,
  WHEEL_DIAMETER_OPTIONS,
  HELP_CONTENT,
} from "../suspension-constants";
import {
  TIRE_OPTIONS,
  TRACTION_MODE_OPTIONS,
} from "@/features/gearbox/gearbox-constants";
import { setVehicleInputs } from "../store";
import { setTireCompound, vehicleInputs } from "@/stores/vehicle";
import { setTractionMode, tireCompound, tractionMode } from "@/features/gearbox/store";

function InputCell(props: { children: any }) {
  return <td class="border-b border-border/50 p-0">{props.children}</td>;
}

function LabelCell(props: {
  label: string;
  help?: { description: string; articles?: any[] };
}) {
  return (
    <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
      <div class="flex items-center justify-between">
        <span>{props.label}</span>
        {props.help && (
          <HelpTooltip
            description={props.help.description}
            articles={props.help.articles}
          />
        )}
      </div>
    </td>
  );
}

export function DrivetrainSection() {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Drivetrain & Wheels" variant="input" />

      {/* Desktop: 3-column layout with viz spanning rows */}
      <div class="hidden sm:block">
        <table class="w-full border-collapse text-sm">
          <tbody>
            {/* Row 1: Drivetrain selector */}
            <tr>
              <td
                rowspan={11}
                class="border-r border-b border-border/50 bg-surface/30 align-middle w-20"
              >
                <div class="flex items-center justify-center p-2">
                  <DrivetrainViz />
                </div>
              </td>
              <LabelCell label="Drivetrain" help={HELP_CONTENT.drivetrain} />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={DRIVETRAIN_OPTIONS}>
                    {(opt) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs("drivetrain", opt)}
                        class="px-3 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          "border-border/50 bg-foreground/10 text-foreground":
                            vehicleInputs.drivetrain === opt,
                          "border-border/50 bg-transparent text-muted hover:border-border/50":
                            vehicleInputs.drivetrain !== opt,
                        }}
                      >
                        {opt}
                      </button>
                    )}
                  </For>
                </div>
              </InputCell>
            </tr>

            {/* Row 2: Front wheel diameter */}
            <tr>
              <LabelCell
                label="Front wheel diameter"
                help={HELP_CONTENT.wheelDiameter}
              />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={WHEEL_DIAMETER_OPTIONS}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleInputs("frontWheel", {
                            ...vehicleInputs.frontWheel,
                            diameter: size,
                          })
                        }
                        class="px-2.5 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          "border-border/50 bg-foreground/10 text-foreground":
                            vehicleInputs.frontWheel.diameter === size,
                          "border-border/50 bg-transparent text-muted hover:border-border/50":
                            vehicleInputs.frontWheel.diameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                  <span class="px-2 text-muted text-xs">in</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 3: Front profile */}
            <tr>
              <LabelCell label="Front profile" help={HELP_CONTENT.profile} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.frontWheel.profile}
                    onChange={(val) =>
                      setVehicleInputs("frontWheel", {
                        ...vehicleInputs.frontWheel,
                        profile: val,
                      })
                    }
                    step={1}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">%</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 4: Front tire width */}
            <tr>
              <LabelCell
                label="Front tire width"
                help={HELP_CONTENT.tireWidth}
              />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.frontWheel.width}
                    onChange={(val) =>
                      setVehicleInputs("frontWheel", {
                        ...vehicleInputs.frontWheel,
                        width: val,
                      })
                    }
                    step={5}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">mm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 5: Front wheel offset */}
            <tr>
              <LabelCell
                label="Front wheel offset"
                help={HELP_CONTENT.frontWheelOffset}
              />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.frontWheelOffset}
                    onChange={(val) =>
                      setVehicleInputs("frontWheelOffset", val)
                    }
                    step={0.1}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">cm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 6: Rear wheel diameter */}
            <tr>
              <LabelCell
                label="Rear wheel diameter"
                help={HELP_CONTENT.wheelDiameter}
              />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={WHEEL_DIAMETER_OPTIONS}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleInputs("rearWheel", {
                            ...vehicleInputs.rearWheel,
                            diameter: size,
                          })
                        }
                        class="px-2.5 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          "border-border/50 bg-foreground/10 text-foreground":
                            vehicleInputs.rearWheel.diameter === size,
                          "border-border/50 bg-transparent text-muted hover:border-border/50":
                            vehicleInputs.rearWheel.diameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                  <span class="px-2 text-muted text-xs">in</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 7: Rear profile */}
            <tr>
              <LabelCell label="Rear profile" help={HELP_CONTENT.profile} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.rearWheel.profile}
                    onChange={(val) =>
                      setVehicleInputs("rearWheel", {
                        ...vehicleInputs.rearWheel,
                        profile: val,
                      })
                    }
                    step={1}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">%</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 8: Rear tire width */}
            <tr>
              <LabelCell
                label="Rear tire width"
                help={HELP_CONTENT.tireWidth}
              />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.rearWheel.width}
                    onChange={(val) =>
                      setVehicleInputs("rearWheel", {
                        ...vehicleInputs.rearWheel,
                        width: val,
                      })
                    }
                    step={5}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">mm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 9: Rear wheel offset */}
            <tr>
              <LabelCell
                label="Rear wheel offset"
                help={HELP_CONTENT.rearWheelOffset}
              />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.rearWheelOffset}
                    onChange={(val) => setVehicleInputs("rearWheelOffset", val)}
                    step={0.1}
                    class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-muted text-xs">cm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 10: Tire compound */}
            <tr>
              <LabelCell label="Tire compound" />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5 flex-wrap">
                  <For each={TIRE_OPTIONS}>
                    {(option) => (
                      <button
                        type="button"
                        onClick={() => setTireCompound("value", option.value)}
                        class="px-2 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          "border-border/50 bg-foreground/10 text-foreground":
                            tireCompound.value === option.value,
                          "border-border/50 bg-transparent text-muted hover:border-border/50":
                            tireCompound.value !== option.value,
                        }}
                      >
                        {option.label}
                      </button>
                    )}
                  </For>
                </div>
              </InputCell>
            </tr>

            {/* Row 11: Traction mode */}
            <tr>
              <LabelCell label="Traction mode" />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={TRACTION_MODE_OPTIONS}>
                    {(option) => (
                      <button
                        type="button"
                        onClick={() => setTractionMode("value", option.value)}
                        class="px-3 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          "border-border/50 bg-foreground/10 text-foreground":
                            tractionMode.value === option.value,
                          "border-border/50 bg-transparent text-muted hover:border-border/50":
                            tractionMode.value !== option.value,
                        }}
                      >
                        {option.label}
                      </button>
                    )}
                  </For>
                </div>
              </InputCell>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile: single column */}
      <div class="block sm:hidden space-y-3 p-3">
        <div class="flex justify-center py-2">
          <DrivetrainViz />
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Drivetrain
          </div>
          <div class="flex items-center gap-1">
            <For each={DRIVETRAIN_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs("drivetrain", option)}
                  class="flex-1 px-2 py-2 border text-[10px] font-medium uppercase tracking-wider transition-colors"
                  classList={{
                    "border-border/50 bg-foreground/10 text-foreground-secondary":
                      vehicleInputs.drivetrain === option,
                    "border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50":
                      vehicleInputs.drivetrain !== option,
                  }}
                >
                  {option}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Front wheel diameter
          </div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() =>
                    setVehicleInputs("frontWheel", {
                      ...vehicleInputs.frontWheel,
                      diameter: size,
                    })
                  }
                  class="flex-1 px-3 py-2 border text-xs font-medium transition-colors"
                  classList={{
                    "border-border/50 bg-foreground/10 text-foreground-secondary":
                      vehicleInputs.frontWheel.diameter === size,
                    "border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50":
                      vehicleInputs.frontWheel.diameter !== size,
                  }}
                >
                  {size}
                </button>
              )}
            </For>
            <span class="px-2 text-muted text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-front-profile"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Front profile
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-profile"
              value={vehicleInputs.frontWheel.profile}
              onChange={(val) =>
                setVehicleInputs("frontWheel", {
                  ...vehicleInputs.frontWheel,
                  profile: val,
                })
              }
              step={1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-front-width"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Front tire width
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-width"
              value={vehicleInputs.frontWheel.width}
              onChange={(val) =>
                setVehicleInputs("frontWheel", {
                  ...vehicleInputs.frontWheel,
                  width: val,
                })
              }
              step={5}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-front-offset"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Front wheel offset
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-offset"
              value={vehicleInputs.frontWheelOffset}
              onChange={(val) => setVehicleInputs("frontWheelOffset", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">cm</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Rear wheel diameter
          </div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() =>
                    setVehicleInputs("rearWheel", {
                      ...vehicleInputs.rearWheel,
                      diameter: size,
                    })
                  }
                  class="flex-1 px-3 py-2 border text-xs font-medium transition-colors"
                  classList={{
                    "border-border/50 bg-foreground/10 text-foreground-secondary":
                      vehicleInputs.rearWheel.diameter === size,
                    "border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50":
                      vehicleInputs.rearWheel.diameter !== size,
                  }}
                >
                  {size}
                </button>
              )}
            </For>
            <span class="px-2 text-muted text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-rear-profile"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Rear profile
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-profile"
              value={vehicleInputs.rearWheel.profile}
              onChange={(val) =>
                setVehicleInputs("rearWheel", {
                  ...vehicleInputs.rearWheel,
                  profile: val,
                })
              }
              step={1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-rear-width"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Rear tire width
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-width"
              value={vehicleInputs.rearWheel.width}
              onChange={(val) =>
                setVehicleInputs("rearWheel", {
                  ...vehicleInputs.rearWheel,
                  width: val,
                })
              }
              step={5}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="m-rear-offset"
            class="block text-xs uppercase tracking-wide text-foreground-secondary"
          >
            Rear wheel offset
          </label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-offset"
              value={vehicleInputs.rearWheelOffset}
              onChange={(val) => setVehicleInputs("rearWheelOffset", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">cm</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Tire compound
          </div>
          <div class="flex items-center gap-1 flex-wrap">
            <For each={TIRE_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setTireCompound("value", option.value)}
                  class="px-2 py-2 border text-[10px] font-medium transition-colors"
                  classList={{
                    "border-border/50 bg-foreground/10 text-foreground-secondary":
                      tireCompound.value === option.value,
                    "border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50":
                      tireCompound.value !== option.value,
                  }}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Traction mode
          </div>
          <div class="flex items-center gap-1">
            <For each={TRACTION_MODE_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setTractionMode("value", option.value)}
                  class="flex-1 px-2 py-2 border text-[10px] font-medium uppercase tracking-wider transition-colors"
                  classList={{
                    "border-border/50 bg-foreground/10 text-foreground-secondary":
                      tractionMode.value === option.value,
                    "border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50":
                      tractionMode.value !== option.value,
                  }}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
