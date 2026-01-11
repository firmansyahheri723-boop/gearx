import { For } from 'solid-js';

export type TabId = 'main' | 'suspension' | 'gearbox' | 'data' | 'map';

type Tab = {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'main', label: 'Input' },
  { id: 'suspension', label: 'Suspension' },
  { id: 'gearbox', label: 'Gearbox' },
  { id: 'data', label: 'Database' },
  { id: 'map', label: 'Map' },
];

type TabMenuProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabMenu(props: TabMenuProps) {
  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50 mb-4">
      <div class="flex">
        <For each={TABS}>
          {(tab) => {
            const isActive = () => props.activeTab === tab.id;
            return (
              <button
                type="button"
                onClick={() => props.onTabChange(tab.id)}
                class="relative flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider transition-colors focus:outline-none"
                classList={{
                  'bg-neutral-900/80 text-neutral-200': isActive(),
                  'bg-transparent text-neutral-500 hover:text-neutral-400 hover:bg-neutral-900/30': !isActive(),
                }}
              >
                {/* Active indicator bar */}
                <div
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 transition-colors"
                  classList={{
                    'bg-neutral-500': isActive(),
                    'bg-transparent': !isActive(),
                  }}
                />
                <span class="font-semibold">{tab.label}</span>
              </button>
            );
          }}
        </For>
        {/* Spacer to fill remaining width */}
        <div class="flex-1 border-b border-neutral-800/30" />
      </div>
    </div>
  );
}
