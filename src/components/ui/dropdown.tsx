import { Component, For, Show, createSignal, createMemo, onMount, onCleanup } from 'solid-js';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}

export const Dropdown: Component<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [search, setSearch] = createSignal('');
  const [highlightedIndex, setHighlightedIndex] = createSignal(0);

  let containerRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  let listRef: HTMLDivElement | undefined;

  // Filter options based on search (search against label)
  const filteredOptions = createMemo(() => {
    const query = search().toLowerCase();
    if (!query) return props.options;
    return props.options.filter((opt) => opt.label.toLowerCase().includes(query));
  });

  // Get label for current value
  const currentLabel = createMemo(() => {
    const opt = props.options.find((o) => o.value === props.value);
    return opt?.label ?? props.value;
  });

  // Reset highlighted index when filtered options change
  const resetHighlight = () => {
    setHighlightedIndex(0);
  };

  // Handle clicking outside to close dropdown
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      closeDropdown();
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  const openDropdown = () => {
    if (props.disabled) return;
    setIsOpen(true);
    setSearch('');
    resetHighlight();
    // Focus input after opening
    requestAnimationFrame(() => inputRef?.focus());
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch('');
    resetHighlight();
  };

  const selectOption = (option: DropdownOption) => {
    props.onChange(option.value);
    closeDropdown();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const options = filteredOptions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen()) {
          openDropdown();
        } else {
          setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
          scrollToHighlighted();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen()) {
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          scrollToHighlighted();
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (isOpen() && options[highlightedIndex()]) {
          selectOption(options[highlightedIndex()]);
        } else if (!isOpen()) {
          openDropdown();
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;

      case 'Tab':
        closeDropdown();
        break;
    }
  };

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    setSearch(target.value);
    resetHighlight();
    if (!isOpen()) {
      setIsOpen(true);
    }
  };

  const scrollToHighlighted = () => {
    requestAnimationFrame(() => {
      const highlighted = listRef?.querySelector('[data-highlighted="true"]');
      highlighted?.scrollIntoView({ block: 'nearest' });
    });
  };

  // Display value: show search when open and typing, otherwise show selected label
  const displayValue = () => {
    if (isOpen()) return search();
    return currentLabel();
  };

  return (
    <div ref={containerRef} class={`relative ${props.class ?? ''}`}>
      {/* Trigger / Input */}
      <div
        class="flex items-center w-full h-full cursor-pointer transition-colors"
        classList={{
          'bg-slate-800/40 hover:bg-cyan-900/30': !isOpen(),
          'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50': isOpen(),
          'opacity-50 cursor-not-allowed': props.disabled,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => !isOpen() && openDropdown()}
          disabled={props.disabled}
          placeholder={props.placeholder ?? 'Select...'}
          class="w-full h-full px-3 py-2 bg-transparent text-emerald-400 cursor-pointer focus:outline-none disabled:cursor-not-allowed placeholder:text-slate-500"
          classList={{
            'cursor-text': isOpen(),
          }}
          autocomplete="off"
          spellcheck={false}
        />
        {/* Dropdown arrow */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => (isOpen() ? closeDropdown() : openDropdown())}
          disabled={props.disabled}
          class="px-3 py-2 transition-transform duration-150 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed"
          classList={{
            'rotate-180': isOpen(),
          }}
          aria-label={isOpen() ? 'Close dropdown' : 'Open dropdown'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M2 4L6 8L10 4" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dropdown panel */}
      <Show when={isOpen()}>
        <div
          ref={listRef}
          class="absolute z-50 left-0 right-0 top-full mt-0.5 max-h-48 overflow-auto border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm shadow-lg shadow-black/30"
        >
          <Show
            when={filteredOptions().length > 0}
            fallback={
              <div class="px-3 py-2 text-slate-500 text-sm">No results found</div>
            }
          >
            <For each={filteredOptions()}>
              {(option, index) => (
                <button
                  type="button"
                  data-highlighted={index() === highlightedIndex()}
                  class="w-full px-3 py-2 cursor-pointer text-sm transition-colors text-left bg-transparent border-none block"
                  classList={{
                    'bg-cyan-900/40 text-cyan-400': index() === highlightedIndex(),
                    'text-slate-300 hover:bg-slate-800/50': index() !== highlightedIndex(),
                    'text-emerald-400': option.value === props.value && index() !== highlightedIndex(),
                  }}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index())}
                >
                  {option.label}
                </button>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
};
