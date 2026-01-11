import { Component, For } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { NumberInput } from './ui/number-input';
import { HelpTooltip } from './ui/help-tooltip';
import { DrivetrainViz } from './ui/drivetrain-viz';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
import {
  DRIVETRAIN_OPTIONS,
  WHEEL_DIAMETER_OPTIONS,
  HELP_CONTENT,
  type DrivetrainOption,
} from './input-section-constants';

function InputCell(props: { children: any }) {
  return (
    <td class="border-b border-neutral-800/50 p-0">
      {props.children}
    </td>
  );
}

function LabelCell(props: { label: string; help?: { description: string; articles?: any[] } }) {
  return (
    <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
      <div class="flex items-center justify-between">
        <span>{props.label}</span>
        {props.help && <HelpTooltip description={props.help.description} articles={props.help.articles} />}
      </div>
    </td>
  );
}

export const DrivetrainSection: Component = () => {
  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
      <SectionHeader title="Drivetrain & Wheels" variant="input" />

      {/* Desktop: 3-column layout with viz spanning rows */}
      <div class="hidden sm:block">
        <table class="w-full border-collapse text-sm">
          <tbody>
            {/* Row 1: Drivetrain selector */}
            <tr>
              <td rowspan={9} class="border-r border-b border-neutral-800/50 bg-neutral-900/30 align-middle w-20">
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
                        onClick={() => setVehicleInputs('drivetrain', opt)}
                        class="px-3 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          'border-neutral-500/50 bg-neutral-500/10 text-neutral-300': vehicleInputs.drivetrain === opt,
                          'border-neutral-700/50 bg-transparent text-neutral-500 hover:border-neutral-600/50': vehicleInputs.drivetrain !== opt,
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
              <LabelCell label="Front wheel diameter" help={HELP_CONTENT.wheelDiameter} />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={WHEEL_DIAMETER_OPTIONS}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, diameter: size })}
                        class="px-2.5 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          'border-neutral-500/50 bg-neutral-500/10 text-neutral-300': vehicleInputs.frontWheel.diameter === size,
                          'border-neutral-700/50 bg-transparent text-neutral-500 hover:border-neutral-600/50': vehicleInputs.frontWheel.diameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                  <span class="px-2 text-neutral-500 text-xs">in</span>
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
                    onChange={(val) => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, profile: val })}
                    step={1}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 4: Front tire width */}
            <tr>
              <LabelCell label="Front tire width" help={HELP_CONTENT.tireWidth} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.frontWheel.width}
                    onChange={(val) => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, width: val })}
                    step={5}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 5: Front wheel offset */}
            <tr>
              <LabelCell label="Front wheel offset" help={HELP_CONTENT.frontWheelOffset} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.frontWheelOffset}
                    onChange={(val) => setVehicleInputs('frontWheelOffset', val)}
                    step={0.1}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 6: Rear wheel diameter */}
            <tr>
              <LabelCell label="Rear wheel diameter" help={HELP_CONTENT.wheelDiameter} />
              <InputCell>
                <div class="flex items-center gap-1 px-2 py-1.5">
                  <For each={WHEEL_DIAMETER_OPTIONS}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, diameter: size })}
                        class="px-2.5 py-1.5 border text-xs font-medium transition-colors"
                        classList={{
                          'border-neutral-500/50 bg-neutral-500/10 text-neutral-300': vehicleInputs.rearWheel.diameter === size,
                          'border-neutral-700/50 bg-transparent text-neutral-500 hover:border-neutral-600/50': vehicleInputs.rearWheel.diameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                  <span class="px-2 text-neutral-500 text-xs">in</span>
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
                    onChange={(val) => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, profile: val })}
                    step={1}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 8: Rear tire width */}
            <tr>
              <LabelCell label="Rear tire width" help={HELP_CONTENT.tireWidth} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.rearWheel.width}
                    onChange={(val) => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, width: val })}
                    step={5}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
                </div>
              </InputCell>
            </tr>

            {/* Row 9: Rear wheel offset */}
            <tr>
              <LabelCell label="Rear wheel offset" help={HELP_CONTENT.rearWheelOffset} />
              <InputCell>
                <div class="flex items-center">
                  <NumberInput
                    value={vehicleInputs.rearWheelOffset}
                    onChange={(val) => setVehicleInputs('rearWheelOffset', val)}
                    step={0.1}
                    class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                  />
                  <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
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
          <div class="text-xs uppercase tracking-wide text-neutral-400">Drivetrain</div>
          <div class="flex items-center gap-1">
            <For each={DRIVETRAIN_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs('drivetrain', option)}
                  class="flex-1 px-2 py-2 border text-[10px] font-medium uppercase tracking-wider transition-colors"
                  classList={{
                    'border-neutral-500/50 bg-neutral-500/10 text-neutral-400': vehicleInputs.drivetrain === option,
                    'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50': vehicleInputs.drivetrain !== option,
                  }}
                >
                  {option}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Front wheel diameter</div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, diameter: size })}
                  class="flex-1 px-3 py-2 border text-xs font-medium transition-colors"
                  classList={{
                    'border-neutral-500/50 bg-neutral-500/10 text-neutral-400': vehicleInputs.frontWheel.diameter === size,
                    'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50': vehicleInputs.frontWheel.diameter !== size,
                  }}
                >
                  {size}
                </button>
              )}
            </For>
            <span class="px-2 text-neutral-500 text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-front-profile" class="block text-xs uppercase tracking-wide text-neutral-400">Front profile</label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-profile"
              value={vehicleInputs.frontWheel.profile}
              onChange={(val) => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, profile: val })}
              step={1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-front-width" class="block text-xs uppercase tracking-wide text-neutral-400">Front tire width</label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-width"
              value={vehicleInputs.frontWheel.width}
              onChange={(val) => setVehicleInputs('frontWheel', { ...vehicleInputs.frontWheel, width: val })}
              step={5}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-front-offset" class="block text-xs uppercase tracking-wide text-neutral-400">Front wheel offset</label>
          <div class="flex items-center">
            <NumberInput
              id="m-front-offset"
              value={vehicleInputs.frontWheelOffset}
              onChange={(val) => setVehicleInputs('frontWheelOffset', val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Rear wheel diameter</div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, diameter: size })}
                  class="flex-1 px-3 py-2 border text-xs font-medium transition-colors"
                  classList={{
                    'border-neutral-500/50 bg-neutral-500/10 text-neutral-400': vehicleInputs.rearWheel.diameter === size,
                    'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50': vehicleInputs.rearWheel.diameter !== size,
                  }}
                >
                  {size}
                </button>
              )}
            </For>
            <span class="px-2 text-neutral-500 text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-rear-profile" class="block text-xs uppercase tracking-wide text-neutral-400">Rear profile</label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-profile"
              value={vehicleInputs.rearWheel.profile}
              onChange={(val) => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, profile: val })}
              step={1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-rear-width" class="block text-xs uppercase tracking-wide text-neutral-400">Rear tire width</label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-width"
              value={vehicleInputs.rearWheel.width}
              onChange={(val) => setVehicleInputs('rearWheel', { ...vehicleInputs.rearWheel, width: val })}
              step={5}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="m-rear-offset" class="block text-xs uppercase tracking-wide text-neutral-400">Rear wheel offset</label>
          <div class="flex items-center">
            <NumberInput
              id="m-rear-offset"
              value={vehicleInputs.rearWheelOffset}
              onChange={(val) => setVehicleInputs('rearWheelOffset', val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
