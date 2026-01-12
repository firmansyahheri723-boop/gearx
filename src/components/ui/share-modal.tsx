import { createSignal, Show } from 'solid-js';
import { generateShareUrl } from "../../features/setups/utils/share";

export function ShareModal(props: { onClose: () => void }) {
  const [copied, setCopied] = createSignal(false);
  const [url, setUrl] = createSignal('');

  const handleGenerate = () => {
    const shareUrl = generateShareUrl();
    setUrl(shareUrl);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={props.onClose}
      />
      <div class="relative bg-surface/95 border border-border/50 shadow-2xl shadow-black/40 w-full max-w-md mx-4">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h2 class="text-sm font-bold uppercase tracking-widest text-foreground">
            Share Setup
          </h2>
          <button
            onClick={props.onClose}
            class="p-1 text-muted hover:text-foreground transition-colors"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <p class="text-xs text-muted mb-4">
            Generate a shareable link for your current suspension and gearbox setup.
          </p>
          <Show when={url() === ''}>
            <button
              onClick={handleGenerate}
              class="w-full px-4 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary transition-colors"
            >
              Generate Share Link
            </button>
          </Show>
          <Show when={url() !== ''}>
            <div class="flex gap-2">
              <input
                type="text"
                readonly
                value={url()}
                class="flex-1 bg-surface-elevated/50 border border-border/50 px-3 py-2 text-xs font-mono text-foreground-secondary focus:outline-none"
              />
              <button
                onClick={handleCopy}
                class="px-4 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary transition-colors whitespace-nowrap"
              >
                {copied() ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={handleGenerate}
              class="mt-3 text-xs text-muted hover:text-foreground-secondary underline w-full text-center"
            >
              Generate new link
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
}
