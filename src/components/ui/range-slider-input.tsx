import { Component, splitProps } from 'solid-js';
import { SliderRoot, SliderControl, SliderTrack, SliderRange, SliderThumb, type SliderValueChangeDetails } from '@ark-ui/solid/slider';

export type RangeSliderInputProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  showNumberInput?: boolean;
  numberInputWidth?: string;
}

export const RangeSliderInput: Component<RangeSliderInputProps> = (props) => {
  const [local] = splitProps(props, ['min', 'max', 'step', 'value', 'onChange', 'minLabel', 'maxLabel', 'showNumberInput', 'numberInputWidth']);

  const decimals = local.step < 1 ? (local.step < 0.1 ? 2 : 1) : 0;

  const getSliderFill = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
  };

  return (
    <div class="flex items-center gap-2 px-3 py-1.5">
      <span class="text-neutral-600 text-xs w-6">{local.minLabel ?? local.min}</span>
      <div class="flex-1 relative h-5 flex items-center">
        <SliderRoot
          value={[local.value]}
          onValueChange={(details: SliderValueChangeDetails) => local.onChange(details.value[0])}
          min={local.min}
          max={local.max}
          step={local.step}
          class="absolute inset-0 w-full h-5 flex items-center"
        >
          <SliderControl>
            <SliderTrack class="absolute inset-x-0 h-1 bg-neutral-700 rounded-full">
              <SliderRange
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
              />
            </SliderTrack>
            <SliderThumb
              index={0}
              class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-neutral-400 rounded-full shadow-lg shadow-neutral-500/30 border border-neutral-300"
            />
          </SliderControl>
        </SliderRoot>
      </div>
      <span class="text-neutral-600 text-xs w-6">{local.maxLabel ?? local.max}</span>
      {local.showNumberInput !== false && (
        <input
          type="number"
          value={local.value}
          onInput={(e) => local.onChange(parseFloat(e.currentTarget.value))}
          step={local.step}
          min={local.min}
          max={local.max}
          class={`px-2 py-0.5 bg-neutral-900/50 border border-neutral-700/50 rounded text-neutral-400 text-sm text-center focus:outline-none focus:text-emerald-400 ${local.numberInputWidth ?? 'w-14'}`}
        />
      )}
    </div>
  );
};
