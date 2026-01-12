import type { SetupTag, SetupTagColor } from '@/types';
import { SETUP_TAG_COLORS } from '@/types';

interface SetupTagProps {
  tag: SetupTag;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  class?: string;
}

export function SetupTag(props: SetupTagProps) {
  return (
    <span
      class={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
        props.class ?? ''
      }`}
      style={{
        'background-color': `${props.tag.color}20`,
        'border': `1px solid ${props.tag.color}40`,
        'color': props.tag.color,
      }}
      onClick={props.onClick}
    >
      <span class="truncate max-w-[100px]">{props.tag.name}</span>
      {props.removable && (
        <button
          type="button"
          class="flex items-center justify-center w-3 h-3 hover:bg-black/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            props.onRemove?.();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

interface TagColorPickerProps {
  selectedColor?: SetupTagColor;
  onColorSelect: (color: SetupTagColor) => void;
}

export function TagColorPicker(props: TagColorPickerProps) {
  return (
    <div class="flex flex-wrap gap-1.5">
      {SETUP_TAG_COLORS.map((color) => (
        <button
          type="button"
          class={`w-5 h-5 border transition-all ${
            props.selectedColor === color
              ? 'border-foreground scale-110'
              : 'border-transparent hover:scale-105'
          }`}
          style={{ 'background-color': color }}
          onClick={() => props.onColorSelect(color)}
          title={color}
        />
      ))}
    </div>
  );
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  colors: SetupTagColor[];
  selectedColor: SetupTagColor;
  onColorSelect: (color: SetupTagColor) => void;
  existingTags?: SetupTag[];
}

export function TagInput(props: TagInputProps) {
  const suggestedTags = ['grip', 'drift', 'drag', 'street', 'track', 'race', 'sport', 'drag', 'tune'];

  return (
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <input
          type="text"
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              props.onSubmit();
            }
          }}
          placeholder="Tag name"
          class="flex-1 bg-surface-elevated/50 border border-border/50 px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/50"
        />
        <TagColorPicker
          selectedColor={props.selectedColor}
          onColorSelect={props.onColorSelect}
        />
      </div>
      {props.value && (
        <div class="flex flex-wrap gap-1">
          {suggestedTags
            .filter((t) => t.toLowerCase().includes(props.value.toLowerCase()))
            .slice(0, 5)
            .map((tag) => (
              <button
                type="button"
                class="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-surface-elevated/50 border border-border/30 text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
                onClick={() => props.onChange(tag)}
              >
                {tag}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
