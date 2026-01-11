import { createSignal, Show } from "solid-js";

type ApiKeyInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  class?: string;
};

export function ApiKeyInput(props: ApiKeyInputProps) {
  const [showKey, setShowKey] = createSignal(false);

  return (
    <div class={`relative flex items-center ${props.class ?? ""}`}>
      <input
        type={showKey() ? "text" : "password"}
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        placeholder={props.placeholder ?? "Enter API key..."}
        class="flex-1 px-3 py-2 bg-surface-elevated/40 text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-inset focus:ring-foreground/50 transition-colors"
        autocomplete="off"
        spellcheck={false}
      />
      <button
        type="button"
        onClick={() => setShowKey(!showKey())}
        class="absolute right-2 p-1 text-muted hover:text-foreground transition-colors"
        title={showKey() ? "Hide API key" : "Show API key"}
      >
        <Show
          when={showKey()}
          fallback={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        </Show>
      </button>
    </div>
  );
}
