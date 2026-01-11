import { createSignal, For, Show } from 'solid-js';
import { themePreference, changeThemePreference, type ThemePreference } from '../stores/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: 'system' | 'sun' | 'moon' }[] = [
  { value: 'system', label: 'SYSTEM', icon: 'system' },
  { value: 'dark', label: 'DARK', icon: 'moon' },
  { value: 'light', label: 'LIGHT', icon: 'sun' },
];

function ThemeIcon(props: { type: 'system' | 'sun' | 'moon'; class?: string }) {
  return (
    <>
      {props.type === 'system' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={props.class}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      )}
      {props.type === 'sun' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={props.class}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
      {props.type === 'moon' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={props.class}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </>
  );
}

export function DashboardHeader() {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const [isOpen, setIsOpen] = createSignal(false);

  const currentOption = () => THEME_OPTIONS.find(o => o.value === themePreference()) ?? THEME_OPTIONS[0];

  const handleSelect = (value: ThemePreference) => {
    changeThemePreference(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  let dropdownRef: HTMLDivElement | undefined;
  
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <header class="border border-border/50 bg-surface/50 mb-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 sm:py-3 gap-2 sm:gap-4">
        {/* Logo / Title */}
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="text-foreground-secondary font-bold text-base sm:text-lg tracking-widest uppercase">
            GearX
          </div>
          <div class="hidden sm:block h-4 w-px bg-border" />
          <div class="hidden sm:flex items-center gap-3 sm:gap-4 text-xs">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-foreground-secondary uppercase tracking-wider">System</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-foreground-secondary uppercase tracking-wider">Calc</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500" />
              <span class="text-foreground-secondary uppercase tracking-wider">Sync</span>
            </span>
          </div>
        </div>

        {/* Right side - Status & Theme Selector */}
        <div class="flex items-center gap-2 sm:gap-4">
          {/* Theme Dropdown */}
          <div 
            ref={dropdownRef}
            class="relative"
            onFocusOut={(e) => {
              // Close if focus leaves the dropdown entirely
              if (!dropdownRef?.contains(e.relatedTarget as Node)) {
                setIsOpen(false);
              }
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(!isOpen());
                if (!isOpen()) {
                  document.addEventListener('click', handleClickOutside, { once: true });
                }
              }}
              class="flex items-center gap-1.5 px-2 py-1 border border-border/50 bg-surface/50 hover:bg-surface-elevated/50 text-muted hover:text-foreground-secondary transition-colors text-[10px] uppercase tracking-wider"
              aria-haspopup="listbox"
              aria-expanded={isOpen()}
            >
              <ThemeIcon type={currentOption().icon} />
              <span class="hidden sm:inline">{currentOption().label}</span>
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
                class="transition-transform"
                classList={{ 'rotate-180': isOpen() }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            <Show when={isOpen()}>
              <div 
                class="absolute right-0 top-full mt-1 z-50 border border-border/50 bg-surface/95 backdrop-blur-sm shadow-lg shadow-black/20 min-w-[100px]"
                role="listbox"
              >
                <For each={THEME_OPTIONS}>
                  {(option) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={themePreference() === option.value}
                      onClick={() => handleSelect(option.value)}
                      class="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors"
                      classList={{
                        'bg-foreground/10 text-foreground': themePreference() === option.value,
                        'text-muted hover:bg-surface-elevated hover:text-foreground-secondary': themePreference() !== option.value,
                      }}
                    >
                      <ThemeIcon type={option.icon} />
                      <span>{option.label}</span>
                      <Show when={themePreference() === option.value}>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="10" 
                          height="10" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          stroke-width="2.5" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"
                          class="ml-auto"
                        >
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      </Show>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
          
          <div class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
            READY
          </div>
          <div class="hidden sm:block text-muted text-xs font-mono">{timestamp}</div>
        </div>
      </div>
    </header>
  );
}
