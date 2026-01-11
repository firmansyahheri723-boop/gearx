import { For } from 'solid-js';
import { SectionHeader } from '../../ui/section-header';
import { SliderRow } from '../../ui/slider-row';
import { vehicleInputs, setVehicleInputs } from '../../../stores/vehicle';
import { SUSPENSION_SLIDERS } from './suspension-tab-constants';

export function SuspensionParametersSection() {
  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
      <SectionHeader
        title="Suspension Parameters"
        variant="input"
        help={{
          description: 'Core suspension settings that define how your car handles bumps and cornering. Ride frequency controls how quickly the suspension oscillates, damping ratio affects how oscillations decay, and roll gradient determines body roll during turns.',
          position: 'bottom',
          articles: [
            { label: 'Wikipedia: Suspension', url: 'https://en.wikipedia.org/wiki/Suspension_(vehicle)' },
          ],
          videos: [
            { label: 'Springs & Dampers Guide', url: 'https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc' },
            { label: 'Suspension Talk', url: 'https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq' },
          ],
        }}
      />
      <div class="p-4 space-y-4">
        <For each={SUSPENSION_SLIDERS}>
          {(slider) => (
            <SliderRow
              label={slider.label}
              help={slider.help}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={vehicleInputs[slider.key] as number}
              onChange={(val) => setVehicleInputs(slider.key, val)}
              unit={slider.unit}
              info={slider.description}
            />
          )}
        </For>
      </div>
    </div>
  );
}
