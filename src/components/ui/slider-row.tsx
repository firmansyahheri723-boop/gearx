import { Component, splitProps } from 'solid-js';
import { HelpTooltip, type HelpLink } from './help-tooltip';

export type SliderRowProps = {
  label: string;
  description?: string;
  articles?: HelpLink[];
  videos?: HelpLink[];
  help?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  info?: string;
}

export const SliderRow: Component<SliderRowProps> = (props) => {
  const [local] = splitProps(props, ['label', 'description', 'articles', 'videos', 'help', 'min', 'max', 'step', 'value', 'onChange', 'unit', 'info']);

  const getSliderFill = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
  };

  const decimals = local.step < 1 ? (local.step < 0.1 ? 2 : 1) : 0;

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-neutral-400">{local.label}</span>
          {local.help && <HelpTooltip description={local.help} position="right" />}
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-sm font-bold text-neutral-400">
            {local.value.toFixed(decimals)}
          </span>
          <span class="text-[10px] text-neutral-500">{local.unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={local.min}
        max={local.max}
        step={local.step}
        value={local.value}
        onInput={(e) => local.onChange(parseFloat(e.currentTarget.value))}
        class="w-full h-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-neutral-500"
        aria-label={local.label}
      />
      {local.info && (
        <div class="text-[10px] text-neutral-600">{local.info}</div>
      )}
    </div>
  );
};
