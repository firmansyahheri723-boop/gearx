import { Component, createSignal, Show } from 'solid-js';
import type { GearRatio } from '../../types';
import { GEAR_COLORS, FINAL_DRIVE_COLOR } from '../../constants/colors';

interface GearSliderProps {
  gear: GearRatio;
  label: string; // e.g. "1st", "2nd", "Final drive"
  index: number;
  gap: number | null;
  isFinalDrive?: boolean;
  onRatioChange: (value: number) => void;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export const GearSlider: Component<GearSliderProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);

  // Get the color for this gear
  const gearColor = () => {
    if (props.isFinalDrive) return FINAL_DRIVE_COLOR;
    return GEAR_COLORS[props.index % GEAR_COLORS.length];
  };

  // Calculate percentage for visual fill
  const fillPercent = () => {
    const range = props.gear.max - props.gear.min;
    if (range === 0) return 0;
    return ((props.gear.ratio - props.gear.min) / range) * 100;
  };

  return (
    <tr class="group border-b border-slate-800/30 last:border-b-0">
      <td
        class="px-3 py-2.5 bg-slate-900/50 text-xs uppercase tracking-wide text-center w-20 border-r border-slate-800/50"
        style={{ color: gearColor() }}
      >
        <div class="flex items-center justify-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full"
            style={{ background: gearColor() }}
          />
          {props.label}
        </div>
      </td>
      <td class="px-4 py-2.5 bg-slate-900/30 border-r border-slate-800/50">
        <div class="flex items-center gap-3">
          {/* Min value */}
          <div class="w-12 flex-shrink-0">
            <Show
              when={isEditing()}
              fallback={
                <button
                  type="button"
                  class="text-slate-600 text-xs hover:text-slate-400 transition-colors bg-transparent border-none p-0 cursor-pointer w-full text-left"
                  onClick={() => setIsEditing(true)}
                >
                  {props.gear.min.toFixed(1)}
                </button>
              }
            >
              <input
                type="number"
                value={props.gear.min}
                step="0.1"
                onInput={(e) => props.onMinChange(parseFloat(e.currentTarget.value) || 0)}
                onBlur={() => setIsEditing(false)}
                class="w-full px-1.5 py-0.5 bg-slate-800 text-xs border border-slate-700 focus:outline-none"
                style={{ color: gearColor(), "border-color": `${gearColor()}80` }}
              />
            </Show>
          </div>

          {/* Slider track */}
          <div class="flex-1 relative h-6 flex items-center">
            <div class="absolute inset-x-0 h-1 bg-slate-800 rounded-full">
              <div
                class="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${fillPercent()}%`,
                  background: `linear-gradient(to right, ${gearColor()}99, ${gearColor()})`,
                }}
              />
            </div>
            <input
              type="range"
              min={props.gear.min}
              max={props.gear.max}
              step="0.01"
              value={props.gear.ratio}
              onInput={(e) => props.onRatioChange(parseFloat(e.currentTarget.value))}
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            {/* Custom thumb */}
            <div
              class="absolute w-3 h-3 rounded-full pointer-events-none border-2"
              style={{
                left: `calc(${fillPercent()}% - 6px)`,
                background: gearColor(),
                "border-color": `${gearColor()}cc`,
                "box-shadow": `0 0 8px ${gearColor()}50`,
              }}
            />
          </div>

          {/* Max value */}
          <div class="w-12 flex-shrink-0 text-right">
            <Show
              when={isEditing()}
              fallback={
                <button
                  type="button"
                  class="text-slate-600 text-xs hover:text-slate-400 transition-colors bg-transparent border-none p-0 cursor-pointer w-full text-right"
                  onClick={() => setIsEditing(true)}
                >
                  {props.gear.max.toFixed(1)}
                </button>
              }
            >
              <input
                type="number"
                value={props.gear.max}
                step="0.1"
                onInput={(e) => props.onMaxChange(parseFloat(e.currentTarget.value) || 0)}
                onBlur={() => setIsEditing(false)}
                class="w-full px-1.5 py-0.5 bg-slate-800 text-xs border border-slate-700 focus:outline-none"
                style={{ color: gearColor(), "border-color": `${gearColor()}80` }}
              />
            </Show>
          </div>
        </div>
      </td>
      <td class="px-3 py-2.5 bg-slate-900/30 w-24 border-r border-slate-800/50">
        <input
          type="number"
          value={props.gear.ratio.toFixed(2)}
          step="0.01"
          onInput={(e) => props.onRatioChange(parseFloat(e.currentTarget.value) || 0)}
          class="w-full bg-transparent text-center focus:outline-none font-medium"
          style={{ color: gearColor() }}
        />
      </td>
      <td class="px-2 py-2.5 bg-slate-900/30 w-16 text-center">
        <Show when={props.gap !== null} fallback={<span class="text-slate-700">—</span>}>
          <span class="text-slate-400">{props.gap!.toFixed(2)}</span>
        </Show>
      </td>
    </tr>
  );
};
