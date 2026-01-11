import { For, createMemo, createSignal } from 'solid-js';
import {
  ComboboxRoot,
  ComboboxControl,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxPositioner,
  ComboboxItem,
  ComboboxItemText,
  createListCollection,
} from '@ark-ui/solid/combobox';

export type DropdownOption = {
  value: string;
  label: string;
}

export type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}

export function Dropdown(props: DropdownProps) {
  const [inputValue, setInputValue] = createSignal('');

  const filteredOptions = createMemo(() => {
    const query = inputValue().toLowerCase().trim();
    if (!query) return props.options;
    return props.options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  });

  const collection = createMemo(() => createListCollection({
    items: filteredOptions(),
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  }));

  const handleValueChange = (details: { value: string[] }) => {
    if (details.value.length > 0) {
      props.onChange(details.value[0]);
    }
  };

  const handleInputChange = (details: { inputValue: string }) => {
    setInputValue(details.inputValue);
  };

  const handleOpenChange = (details: { open: boolean }) => {
    if (details.open) {
      // Clear input when opening to allow fresh search
      setInputValue('');
    }
  };

  // Get the display label for current value
  const displayValue = createMemo(() => {
    const selected = props.options.find(opt => opt.value === props.value);
    return selected?.label ?? '';
  });

  return (
    <div class={`relative ${props.class ?? ''}`}>
      <ComboboxRoot
        collection={collection()}
        value={props.value ? [props.value] : []}
        inputValue={inputValue()}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputChange}
        onOpenChange={handleOpenChange}
        disabled={props.disabled}
        openOnClick
        selectionBehavior="replace"
        positioning={{ sameWidth: true }}
      >
        <ComboboxControl class="flex items-center w-full h-full px-3 py-2 bg-surface-elevated/40 text-foreground cursor-pointer transition-colors hover:bg-surface/30 focus-within:bg-foreground/10 focus-within:ring-1 focus-within:ring-inset focus-within:ring-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed">
          <ComboboxInput
            placeholder={displayValue() || props.placeholder || 'Select...'}
            class="flex-1 text-left bg-transparent focus:outline-none text-foreground placeholder:text-foreground-secondary"
          />
          <ComboboxTrigger class="px-2 py-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </ComboboxTrigger>
        </ComboboxControl>
        <ComboboxPositioner>
          <ComboboxContent class="z-50 max-h-48 overflow-auto border border-border/50 bg-surface/95 backdrop-blur-sm shadow-lg shadow-black/30">
            <For each={filteredOptions()}>
              {(option) => (
                <ComboboxItem
                  item={option}
                  class="w-full px-3 py-2 cursor-pointer text-sm transition-colors text-left bg-transparent border-none block focus:outline-none data-[highlighted]:bg-surface-elevated/50 data-[highlighted]:text-foreground data-[state=checked]:text-emerald-400 hover:bg-surface-elevated/50"
                >
                  <ComboboxItemText>{option.label}</ComboboxItemText>
                </ComboboxItem>
              )}
            </For>
          </ComboboxContent>
        </ComboboxPositioner>
      </ComboboxRoot>
    </div>
  );
}
