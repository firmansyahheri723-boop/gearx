import { createSignal, createEffect, type JSX, splitProps } from "solid-js";

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  class?: string;
  style?: JSX.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
}

export function NumberInput(props: NumberInputProps) {
  const [local, inputProps] = splitProps(props, [
    "value",
    "onChange",
    "onBlur",
    "min",
    "max",
    "class",
  ]);

  // Local string state for the input value during editing
  const [displayValue, setDisplayValue] = createSignal(String(local.value));
  const [isFocused, setIsFocused] = createSignal(false);

  // Sync display value with external value when not focused
  createEffect(() => {
    if (!isFocused()) {
      setDisplayValue(String(local.value));
    }
  });

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setDisplayValue(e.currentTarget.value);
  };

  const handleFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = () => {
    setIsFocused(true);
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = () => {
    // Replace comma with dot for locales that use comma as decimal separator
    const rawValue = displayValue().replace(',', '.');
    let parsed = parseFloat(rawValue);

    // Handle invalid input - revert to current value
    if (isNaN(parsed)) {
      setDisplayValue(String(local.value));
      setIsFocused(false);
      local.onBlur?.();
      return;
    }

    // Clamp to min/max bounds if specified
    if (local.min !== undefined && parsed < local.min) {
      parsed = local.min;
    }
    if (local.max !== undefined && parsed > local.max) {
      parsed = local.max;
    }

    // Update display to the clamped/cleaned value
    setDisplayValue(String(parsed));

    // Only call onChange if the value actually changed
    if (parsed !== local.value) {
      local.onChange(parsed);
    }

    // Set isFocused to false AFTER processing to prevent createEffect from
    // overwriting the display value before we've had a chance to update it
    setIsFocused(false);

    // Call parent's onBlur handler if provided
    local.onBlur?.();
  };

  return (
    <input
      type="number"
      value={displayValue()}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      class={local.class}
      {...inputProps}
    />
  );
}
