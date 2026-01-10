import { Component, For } from 'solid-js';

export type TabId = 'main' | 'suspension' | 'gearbox' | 'data';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'main', label: 'Input' },
  { id: 'suspension', label: 'Suspension' },
  { id: 'gearbox', label: 'Gearbox' },
  { id: 'data', label: 'Database' },
];

interface TabMenuProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const TabMenu: Component<TabMenuProps> = (props) => {
  return (
    <div class="border border-slate-800/50 bg-slate-950/50 mb-4">
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
                  'bg-slate-900/80 text-slate-200': isActive(),
                  'bg-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-900/30': !isActive(),
                }}
              >
                {/* Active indicator bar */}
                <div
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 transition-colors"
                  classList={{
                    'bg-cyan-500': isActive(),
                    'bg-transparent': !isActive(),
                  }}
                />
                <span class="font-semibold">{tab.label}</span>
              </button>
            );
          }}
        </For>
        {/* Spacer to fill remaining width */}
        <div class="flex-1 border-b border-slate-800/30" />
      </div>
    </div>
  );
};
