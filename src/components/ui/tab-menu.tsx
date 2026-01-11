import { For } from 'solid-js';
import { TabsRoot, TabList, TabTrigger } from '@ark-ui/solid/tabs';

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
  const handleValueChange = (details: { value: string }) => {
    props.onTabChange(details.value as TabId);
  };

  return (
    <TabsRoot
      value={props.activeTab}
      onValueChange={handleValueChange}
    >
      <div class="border border-neutral-800/50 bg-neutral-950/50 mb-4">
        <TabList class="flex overflow-x-auto scrollbar-hide">
          <For each={TABS}>
            {(tab) => {
              const isActive = () => props.activeTab === tab.id;
              return (
                <TabTrigger
                  value={tab.id}
                  class="relative flex items-center gap-2 px-3 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider transition-colors focus:outline-none shrink-0 whitespace-nowrap border-b-2"
                  classList={{
                    'bg-neutral-900/80 text-neutral-200 border-neutral-500': isActive(),
                    'bg-transparent text-neutral-500 hover:text-neutral-400 hover:bg-neutral-900/30 border-transparent': !isActive(),
                  }}
                >
                  <span class="font-semibold">{tab.label}</span>
                </TabTrigger>
              );
            }}
          </For>
          {/* Spacer to fill remaining width */}
          <div class="flex-1 border-b border-neutral-800/30 shrink-0" />
        </TabList>
      </div>
    </TabsRoot>
  );
}
