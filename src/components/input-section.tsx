import { Component, createMemo, Show } from "solid-js";
import { SectionHeader } from "./ui/section-header";
import { Dropdown, type DropdownOption } from "./ui/dropdown";
import { NumberInput } from "./ui/number-input";
import { InputRow } from "./ui/input-row";
import { SegmentedRow, type SegmentedRowOption } from "./ui/segmented-row";
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

  const getSliderFill = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
  };

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
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-neutral-600 text-xs w-6">3</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-neutral-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
                      style={{
                        width: `${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={5}
                    step={0.1}
                    value={vehicleInputs.desiredRideFrequency}
                    onInput={(e) =>
                      setVehicleInputs(
                        "desiredRideFrequency",
                        parseFloat(e.currentTarget.value),
                      )
                    }
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-neutral-400 rounded-full shadow-lg shadow-neutral-500/30 pointer-events-none border border-neutral-300"
                    style={{
                      left: `calc(${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}% - 5px)`,
                    }}
                  />
                </div>
                <span class="text-neutral-600 text-xs w-6">5</span>
                <NumberInput
                  value={vehicleInputs.desiredRideFrequency}
                  onChange={(val) => setVehicleInputs("desiredRideFrequency", val)}
                  step={0.1}
                  min={3}
                  max={5}
                  class="w-14 px-2 py-0.5 bg-neutral-900/50 border border-neutral-700/50 rounded text-neutral-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Roll gradient</span>
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-neutral-600 text-xs w-6">.02</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-neutral-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
                      style={{
                        width: `${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.7}
                    step={0.01}
                    value={vehicleInputs.desiredRollGradient}
                    onInput={(e) =>
                      setVehicleInputs(
                        "desiredRollGradient",
                        parseFloat(e.currentTarget.value),
                      )
                    }
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-neutral-400 rounded-full shadow-lg shadow-neutral-500/30 pointer-events-none border border-neutral-300"
                    style={{
                      left: `calc(${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}% - 5px)`,
                    }}
                  />
                </div>
                <span class="text-neutral-600 text-xs w-6">.7</span>
                <NumberInput
                  value={vehicleInputs.desiredRollGradient}
                  onChange={(val) => setVehicleInputs("desiredRollGradient", val)}
                  step={0.01}
                  min={0.02}
                  max={0.7}
                  class="w-14 px-2 py-0.5 bg-neutral-900/50 border border-neutral-700/50 rounded text-neutral-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          <SegmentedRow
            label="Wheel diameter"
            description={HELP_CONTENT.wheelDiameter.description}
            articles={HELP_CONTENT.wheelDiameter.articles}
            value={vehicleInputs.wheelDiameter}
            onChange={(val) => setVehicleInputs("wheelDiameter", val as number)}
            unit="in"
            options={WHEEL_DIAMETER_OPTIONS.map((size) => ({ label: size.toString(), value: size })) as SegmentedRowOption[]}
          />

          <InputRow
            label="Profile"
            description={HELP_CONTENT.profile.description}
            articles={HELP_CONTENT.profile.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.profile}
                onChange={(val) => setVehicleInputs("profile", val)}
                step={1}
                class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
            </div>
          </InputRow>

          <InputRow
            label="Tire width"
            description={HELP_CONTENT.tireWidth.description}
            articles={HELP_CONTENT.tireWidth.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.tireWidth}
                onChange={(val) => setVehicleInputs("tireWidth", val)}
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
            onChange={(val) => setVehicleInputs("drivetrain", val as string)}
            options={DRIVETRAIN_OPTIONS.map((opt) => ({ label: opt, value: opt })) as SegmentedRowOption[]}
          />
        </tbody>
      </table>
    </div>
  );
};
