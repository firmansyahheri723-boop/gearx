import { Component, createMemo, Show, For } from "solid-js";
import { SectionHeader } from "./ui/section-header";
import { Dropdown, type DropdownOption } from "./ui/dropdown";
import { NumberInput } from "./ui/number-input";
import { InputRow } from "./ui/input-row";
import { SegmentedRow, type SegmentedRowOption } from "./ui/segmented-row";
import { RangeSliderInput } from "./ui/range-slider-input";
import { vehicleInputs, setVehicleInputs } from "../stores/vehicle";
import {
  carData,
  selectCar,
  selectEngine,
  selectedCarIndex,
  selectedEngineIndex,
  getSelectedCar,
  getSelectedEngine,
} from "../stores/car-data";
import {
  HELP_CONTENT,
  DRIVETRAIN_OPTIONS,
  WHEEL_DIAMETER_OPTIONS,
  type DrivetrainOption,
} from "./input-section-constants";

export const InputSection: Component = () => {
  const carOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: "", label: "No cars imported" }];
    }
    return carData.map((car) => {
      const name = car.car || "Unknown";
      return { value: name, label: name };
    });
  });

  const engineOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: "", label: "No engines imported" }];
    }
    return carData
      .filter((car) => {
        const name = car.car || "";
        return !name.toLowerCase().includes("swapped transmission");
      })
      .map((car) => {
        const name = car.car || "Unknown";
        let label = name;

        if (name.toLowerCase().endsWith("engine")) {
        } else if (name.toLowerCase().includes("swapped engine")) {
          label = name.replace(/swapped engine/i, "[Swapped Engine]");
        } else {
          label = `${name} [Default Engine]`;
        }

        return { value: name, label };
      });
  });

  const handleCarChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectCar(index);
    }
  };

  const handleEngineChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectEngine(index);
    }
  };

  const decimals = (step: number) => step < 1 ? (step < 0.1 ? 2 : 1) : 0;

  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
      <SectionHeader title="Vehicle Input" variant="input" />

      <Show
        when={selectedCarIndex() !== null || selectedEngineIndex() !== null}
      >
        <div class="px-3 py-1.5 border-b border-neutral-800/50 bg-neutral-900/50 flex items-center gap-4 text-[10px]">
          <Show when={getSelectedCar()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-neutral-400">Chassis:</span>
              <span class="text-green-400 font-medium">
                {getSelectedCar()?.car}
              </span>
            </span>
          </Show>
          <Show when={getSelectedEngine()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-amber-500 rounded-full" />
              <span class="text-neutral-400">Engine:</span>
              <span class="text-amber-400 font-medium">
                {getSelectedEngine()?.car}
              </span>
            </span>
          </Show>
        </div>
      </Show>

      <table class="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50 w-1/3">
              <div class="flex items-center justify-between">
                <span>Car selection</span>
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0">
              <Dropdown
                value={vehicleInputs.carSelection}
                options={carOptions()}
                onChange={handleCarChange}
                disabled={carData.length === 0}
                placeholder="Select car..."
              />
            </td>
          </tr>

          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Engine selection</span>
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0">
              <Dropdown
                value={vehicleInputs.engineSelection}
                options={engineOptions()}
                onChange={handleEngineChange}
                disabled={carData.length === 0}
                placeholder="Select engine..."
              />
            </td>
          </tr>

          <InputRow
            label="Weight"
            description={HELP_CONTENT.weight.description}
            articles={HELP_CONTENT.weight.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.weight}
                onChange={(val) => setVehicleInputs("weight", val)}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">kg</span>
            </div>
          </InputRow>

          <InputRow
            label="Front weight distribution"
            description={HELP_CONTENT.frontWeightDistribution.description}
            articles={HELP_CONTENT.frontWeightDistribution.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.frontWeightDistribution}
                onChange={(val) => setVehicleInputs("frontWeightDistribution", val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
            </div>
          </InputRow>

          <InputRow
            label="Front wheel offset"
            description={HELP_CONTENT.frontWheelOffset.description}
            articles={HELP_CONTENT.frontWheelOffset.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.frontWheelOffset}
                onChange={(val) => setVehicleInputs("frontWheelOffset", val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
            </div>
          </InputRow>

          <InputRow
            label="Rear wheel offset"
            description={HELP_CONTENT.rearWheelOffset.description}
            articles={HELP_CONTENT.rearWheelOffset.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.rearWheelOffset}
                onChange={(val) => setVehicleInputs("rearWheelOffset", val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
            </div>
          </InputRow>

          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Ride frequency</span>
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <RangeSliderInput
                min={3}
                max={5}
                step={0.1}
                value={vehicleInputs.desiredRideFrequency}
                onChange={(val) => setVehicleInputs("desiredRideFrequency", val)}
                minLabel="3"
                maxLabel="5"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Roll gradient</span>
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <RangeSliderInput
                min={0.02}
                max={0.7}
                step={0.01}
                value={vehicleInputs.desiredRollGradient}
                onChange={(val) => setVehicleInputs("desiredRollGradient", val)}
                minLabel=".02"
                maxLabel=".7"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <SegmentedRow
            label="Front wheel diameter"
            description={HELP_CONTENT.wheelDiameter.description}
            articles={HELP_CONTENT.wheelDiameter.articles}
            value={vehicleInputs.frontWheel.diameter}
            onChange={(val) => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, diameter: val as number })}
            unit="in"
            options={WHEEL_DIAMETER_OPTIONS.map((size) => ({ label: size.toString(), value: size })) as SegmentedRowOption[]}
          />

          <SegmentedRow
            label="Rear wheel diameter"
            description={HELP_CONTENT.wheelDiameter.description}
            articles={HELP_CONTENT.wheelDiameter.articles}
            value={vehicleInputs.rearWheel.diameter}
            onChange={(val) => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, diameter: val as number })}
            unit="in"
            options={WHEEL_DIAMETER_OPTIONS.map((size) => ({ label: size.toString(), value: size })) as SegmentedRowOption[]}
          />

          <InputRow
            label="Front profile"
            description={HELP_CONTENT.profile.description}
            articles={HELP_CONTENT.profile.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.frontWheel.profile}
                onChange={(val) => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, profile: val })}
                step={1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
            </div>
          </InputRow>

          <InputRow
            label="Rear profile"
            description={HELP_CONTENT.profile.description}
            articles={HELP_CONTENT.profile.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.rearWheel.profile}
                onChange={(val) => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, profile: val })}
                step={1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
            </div>
          </InputRow>

          <InputRow
            label="Front tire width"
            description={HELP_CONTENT.tireWidth.description}
            articles={HELP_CONTENT.tireWidth.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.frontWheel.width}
                onChange={(val) => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, width: val })}
                step={5}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
            </div>
          </InputRow>

          <InputRow
            label="Rear tire width"
            description={HELP_CONTENT.tireWidth.description}
            articles={HELP_CONTENT.tireWidth.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.rearWheel.width}
                onChange={(val) => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, width: val })}
                step={5}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
            </div>
          </InputRow>

          <InputRow
            label="CoG height"
            description={HELP_CONTENT.cogHeight.description}
            articles={HELP_CONTENT.cogHeight.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.cogHeight}
                onChange={(val) => setVehicleInputs("cogHeight", val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">in</span>
            </div>
          </InputRow>

          <InputRow
            label="0-100 km/h"
            description={HELP_CONTENT.acceleration.description}
            articles={HELP_CONTENT.acceleration.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.acceleration0to100}
                onChange={(val) => setVehicleInputs("acceleration0to100", val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">s</span>
            </div>
          </InputRow>

          <InputRow
            label="Redline RPM"
            description={HELP_CONTENT.redlineRpm.description}
            articles={HELP_CONTENT.redlineRpm.articles}
            videos={HELP_CONTENT.redlineRpm.videos}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.redlineRpm}
                onChange={(val) => setVehicleInputs("redlineRpm", val)}
                step={100}
                min={3000}
                max={15000}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">rpm</span>
            </div>
          </InputRow>

          <InputRow
            label="Max speed @ 118m"
            description={HELP_CONTENT.maxSpeed118m.description}
            articles={HELP_CONTENT.maxSpeed118m.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.maxSpeed118mRadius}
                onChange={(val) => setVehicleInputs("maxSpeed118mRadius", val)}
                step={1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">km/h</span>
            </div>
          </InputRow>

          <SegmentedRow
            label="Drivetrain"
            description={HELP_CONTENT.drivetrain.description}
            articles={HELP_CONTENT.drivetrain.articles}
            value={vehicleInputs.drivetrain}
            onChange={(val) => setVehicleInputs("drivetrain", val as DrivetrainOption)}
            options={DRIVETRAIN_OPTIONS.map((opt) => ({ label: opt, value: opt })) as SegmentedRowOption[]}
          />
        </tbody>
      </table>

      <div class="block sm:hidden space-y-3 p-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Car selection</div>
          <Dropdown
            value={vehicleInputs.carSelection}
            options={carOptions()}
            onChange={handleCarChange}
            disabled={carData.length === 0}
            placeholder="Select car..."
          />
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Engine selection</div>
          <Dropdown
            value={vehicleInputs.engineSelection}
            options={engineOptions()}
            onChange={handleEngineChange}
            disabled={carData.length === 0}
            placeholder="Select engine..."
          />
        </div>

        <div class="space-y-1">
          <label for="mobile-weight" class="block text-xs uppercase tracking-wide text-neutral-400">Weight</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-weight"
              value={vehicleInputs.weight}
              onChange={(val) => setVehicleInputs("weight", val)}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">kg</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-front-weight-dist" class="block text-xs uppercase tracking-wide text-neutral-400">Front weight distribution</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-front-weight-dist"
              value={vehicleInputs.frontWeightDistribution}
              onChange={(val) => setVehicleInputs("frontWeightDistribution", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-front-offset" class="block text-xs uppercase tracking-wide text-neutral-400">Front wheel offset</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-front-offset"
              value={vehicleInputs.frontWheelOffset}
              onChange={(val) => setVehicleInputs("frontWheelOffset", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-rear-offset" class="block text-xs uppercase tracking-wide text-neutral-400">Rear wheel offset</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-rear-offset"
              value={vehicleInputs.rearWheelOffset}
              onChange={(val) => setVehicleInputs("rearWheelOffset", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="mobile-ride-freq" class="block text-xs uppercase tracking-wide text-neutral-400">Ride frequency</label>
            <span class="text-sm text-neutral-400">{vehicleInputs.desiredRideFrequency.toFixed(decimals(0.1))} Hz</span>
          </div>
          <RangeSliderInput
            min={3}
            max={5}
            step={0.1}
            value={vehicleInputs.desiredRideFrequency}
            onChange={(val) => setVehicleInputs("desiredRideFrequency", val)}
            minLabel="3"
            maxLabel="5"
            showNumberInput={false}
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="mobile-roll-grad" class="block text-xs uppercase tracking-wide text-neutral-400">Roll gradient</label>
            <span class="text-sm text-neutral-400">{vehicleInputs.desiredRollGradient.toFixed(decimals(0.01))}</span>
          </div>
          <RangeSliderInput
            min={0.02}
            max={0.7}
            step={0.01}
            value={vehicleInputs.desiredRollGradient}
            onChange={(val) => setVehicleInputs("desiredRollGradient", val)}
            minLabel=".02"
            maxLabel=".7"
            showNumberInput={false}
          />
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Front wheel diameter</div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, diameter: size })}
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
          <div class="text-xs uppercase tracking-wide text-neutral-400">Rear wheel diameter</div>
          <div class="flex items-center gap-1">
            <For each={WHEEL_DIAMETER_OPTIONS}>
              {(size) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, diameter: size })}
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
          <label for="mobile-front-profile" class="block text-xs uppercase tracking-wide text-neutral-400">Front profile</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-front-profile"
              value={vehicleInputs.frontWheel.profile}
              onChange={(val) => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, profile: val })}
              step={1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-rear-profile" class="block text-xs uppercase tracking-wide text-neutral-400">Rear profile</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-rear-profile"
              value={vehicleInputs.rearWheel.profile}
              onChange={(val) => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, profile: val })}
              step={1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-front-tire-width" class="block text-xs uppercase tracking-wide text-neutral-400">Front tire width</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-front-tire-width"
              value={vehicleInputs.frontWheel.width}
              onChange={(val) => setVehicleInputs("frontWheel", { ...vehicleInputs.frontWheel, width: val })}
              step={5}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-rear-tire-width" class="block text-xs uppercase tracking-wide text-neutral-400">Rear tire width</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-rear-tire-width"
              value={vehicleInputs.rearWheel.width}
              onChange={(val) => setVehicleInputs("rearWheel", { ...vehicleInputs.rearWheel, width: val })}
              step={5}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-cog-height" class="block text-xs uppercase tracking-wide text-neutral-400">CoG height</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-cog-height"
              value={vehicleInputs.cogHeight}
              onChange={(val) => setVehicleInputs("cogHeight", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-acceleration" class="block text-xs uppercase tracking-wide text-neutral-400">0-100 km/h</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-acceleration"
              value={vehicleInputs.acceleration0to100}
              onChange={(val) => setVehicleInputs("acceleration0to100", val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">s</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-redline" class="block text-xs uppercase tracking-wide text-neutral-400">Redline RPM</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-redline"
              value={vehicleInputs.redlineRpm}
              onChange={(val) => setVehicleInputs("redlineRpm", val)}
              step={100}
              min={3000}
              max={15000}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">rpm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-max-speed" class="block text-xs uppercase tracking-wide text-neutral-400">Max speed @ 118m</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-max-speed"
              value={vehicleInputs.maxSpeed118mRadius}
              onChange={(val) => setVehicleInputs("maxSpeed118mRadius", val)}
              step={1}
              class="flex-1 px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-400 focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-neutral-500 text-xs">km/h</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-neutral-400">Drivetrain</div>
          <div class="flex items-center gap-1">
            <For each={DRIVETRAIN_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setVehicleInputs("drivetrain", option)}
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
      </div>
    </div>
  );
};
