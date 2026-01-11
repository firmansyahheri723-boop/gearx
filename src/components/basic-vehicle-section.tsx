import { Component, createMemo, Show, For } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { Dropdown, type DropdownOption } from './ui/dropdown';
import { NumberInput } from './ui/number-input';
import { InputRow } from './ui/input-row';
import { RangeSliderInput } from './ui/range-slider-input';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
import {
  carData,
  selectCar,
  selectEngine,
  selectedCarIndex,
  selectedEngineIndex,
  getSelectedCar,
  getSelectedEngine,
} from '../stores/car-data';
import { HELP_CONTENT } from './input-section-constants';

export const BasicVehicleSection: Component = () => {
  const carOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: '', label: 'No cars imported' }];
    }
    return carData.map((car) => {
      const name = car.car || 'Unknown';
      return { value: name, label: name };
    });
  });

  const engineOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: '', label: 'No engines imported' }];
    }

    const carNames = new Set(
      carData
        .filter((car) => {
          const name = car.car || '';
          return !name.toLowerCase().includes('swapped engine');
        })
        .map((car) => car.car)
    );

    return carData
      .filter((car) => {
        const name = car.car || '';
        return !name.toLowerCase().includes('swapped transmission');
      })
      .map((car) => {
        const name = car.car || 'Unknown';
        let label = name;

        if (name.toLowerCase().endsWith('engine')) {
        } else if (name.toLowerCase().includes('swapped engine')) {
          label = name.replace(/swapped engine/i, '[Swapped Engine]');
        } else if (carNames.has(name)) {
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

  const decimals = (step: number) => (step < 1 ? (step < 0.1 ? 2 : 1) : 0);

  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Vehicle Input" variant="input" />

      <Show
        when={selectedCarIndex() !== null || selectedEngineIndex() !== null}
      >
        <div class="px-3 py-1.5 border-b border-border/50 bg-surface/50 flex items-center gap-4 text-[10px]">
          <Show when={getSelectedCar()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-foreground-secondary">Chassis:</span>
              <span class="text-green-400 font-medium">
                {getSelectedCar()?.car}
              </span>
            </span>
          </Show>
          <Show when={getSelectedEngine()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-amber-500 rounded-full" />
              <span class="text-foreground-secondary">Engine:</span>
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
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50 w-1/3">
              <div class="flex items-center justify-between">
                <span>Car selection</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0">
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
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
              <div class="flex items-center justify-between">
                <span>Engine selection</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0">
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
                onChange={(val) => setVehicleInputs('weight', val)}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">kg</span>
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
                onChange={(val) => setVehicleInputs('frontWeightDistribution', val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">%</span>
            </div>
          </InputRow>

          <tr>
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
              <div class="flex items-center justify-between">
                <span>Ride frequency</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0 bg-surface-elevated/40">
              <RangeSliderInput
                min={3}
                max={5}
                step={0.1}
                value={vehicleInputs.desiredRideFrequency}
                onChange={(val) => setVehicleInputs('desiredRideFrequency', val)}
                minLabel="3"
                maxLabel="5"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <tr>
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
              <div class="flex items-center justify-between">
                <span>Roll gradient</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0 bg-surface-elevated/40">
              <RangeSliderInput
                min={0.02}
                max={0.7}
                step={0.01}
                value={vehicleInputs.desiredRollGradient}
                onChange={(val) => setVehicleInputs('desiredRollGradient', val)}
                minLabel=".02"
                maxLabel=".7"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <InputRow
            label="CoG height"
            description={HELP_CONTENT.cogHeight.description}
            articles={HELP_CONTENT.cogHeight.articles}
          >
            <div class="flex items-center">
              <NumberInput
                value={vehicleInputs.cogHeight}
                onChange={(val) => setVehicleInputs('cogHeight', val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">in</span>
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
                onChange={(val) => setVehicleInputs('acceleration0to100', val)}
                step={0.1}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">s</span>
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
                onChange={(val) => setVehicleInputs('redlineRpm', val)}
                step={100}
                min={3000}
                max={15000}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">rpm</span>
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
                onChange={(val) => setVehicleInputs('maxSpeed118mRadius', val)}
                step={1}
                class="flex-1 px-3 py-2 bg-transparent text-foreground-secondary focus:outline-none focus:text-emerald-400"
              />
              <span class="px-3 py-2 text-muted text-xs">km/h</span>
            </div>
          </InputRow>
        </tbody>
      </table>

      <div class="block sm:hidden space-y-3 p-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">Car selection</div>
          <Dropdown
            value={vehicleInputs.carSelection}
            options={carOptions()}
            onChange={handleCarChange}
            disabled={carData.length === 0}
            placeholder="Select car..."
          />
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">Engine selection</div>
          <Dropdown
            value={vehicleInputs.engineSelection}
            options={engineOptions()}
            onChange={handleEngineChange}
            disabled={carData.length === 0}
            placeholder="Select engine..."
          />
        </div>

        <div class="space-y-1">
          <label for="mobile-weight" class="block text-xs uppercase tracking-wide text-foreground-secondary">Weight</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-weight"
              value={vehicleInputs.weight}
              onChange={(val) => setVehicleInputs('weight', val)}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">kg</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-front-weight-dist" class="block text-xs uppercase tracking-wide text-foreground-secondary">Front weight distribution</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-front-weight-dist"
              value={vehicleInputs.frontWeightDistribution}
              onChange={(val) => setVehicleInputs('frontWeightDistribution', val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">%</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="mobile-ride-freq" class="block text-xs uppercase tracking-wide text-foreground-secondary">Ride frequency</label>
            <span class="text-sm text-foreground-secondary">{vehicleInputs.desiredRideFrequency.toFixed(decimals(0.1))} Hz</span>
          </div>
          <RangeSliderInput
            min={3}
            max={5}
            step={0.1}
            value={vehicleInputs.desiredRideFrequency}
            onChange={(val) => setVehicleInputs('desiredRideFrequency', val)}
            minLabel="3"
            maxLabel="5"
            showNumberInput={false}
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="mobile-roll-grad" class="block text-xs uppercase tracking-wide text-foreground-secondary">Roll gradient</label>
            <span class="text-sm text-foreground-secondary">{vehicleInputs.desiredRollGradient.toFixed(decimals(0.01))}</span>
          </div>
          <RangeSliderInput
            min={0.02}
            max={0.7}
            step={0.01}
            value={vehicleInputs.desiredRollGradient}
            onChange={(val) => setVehicleInputs('desiredRollGradient', val)}
            minLabel=".02"
            maxLabel=".7"
            showNumberInput={false}
          />
        </div>

        <div class="space-y-1">
          <label for="mobile-cog-height" class="block text-xs uppercase tracking-wide text-foreground-secondary">CoG height</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-cog-height"
              value={vehicleInputs.cogHeight}
              onChange={(val) => setVehicleInputs('cogHeight', val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">in</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-acceleration" class="block text-xs uppercase tracking-wide text-foreground-secondary">0-100 km/h</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-acceleration"
              value={vehicleInputs.acceleration0to100}
              onChange={(val) => setVehicleInputs('acceleration0to100', val)}
              step={0.1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">s</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-redline" class="block text-xs uppercase tracking-wide text-foreground-secondary">Redline RPM</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-redline"
              value={vehicleInputs.redlineRpm}
              onChange={(val) => setVehicleInputs('redlineRpm', val)}
              step={100}
              min={3000}
              max={15000}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">rpm</span>
          </div>
        </div>

        <div class="space-y-1">
          <label for="mobile-max-speed" class="block text-xs uppercase tracking-wide text-foreground-secondary">Max speed @ 118m</label>
          <div class="flex items-center">
            <NumberInput
              id="mobile-max-speed"
              value={vehicleInputs.maxSpeed118mRadius}
              onChange={(val) => setVehicleInputs('maxSpeed118mRadius', val)}
              step={1}
              class="flex-1 px-3 py-2 bg-surface/50 border border-border/50 rounded text-foreground-secondary focus:outline-none focus:border-emerald-500/50"
            />
            <span class="px-3 py-2 text-muted text-xs">km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
