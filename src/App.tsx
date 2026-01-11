import { onMount, onCleanup, createSignal, Match, Switch } from 'solid-js';
import { DashboardHeader } from './components/dashboard-header';
import { TabMenu, type TabId } from './components/ui/tab-menu';
import { InputTab } from './components/tabs/main-tab';
import { SuspensionTab } from './components/tabs/suspension-tab';
import { GearboxTab } from './components/tabs/gearbox-tab';
import { DatabaseTab } from './components/tabs/data-tab';
import { MapTab } from './components/tabs/map-tab';
import {
  setIsSelecting,
  selectionStart,
  clearSelection,
} from './stores/selection';
import { torqueRpmData, setTorqueRpmData, gearRatios, setGearRatios } from './stores/vehicle';
import { initThemeListener } from './stores/theme';

const VALID_TABS: TabId[] = ['main', 'suspension', 'gearbox', 'data', 'map'];

const getInitialTab = (): TabId => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && VALID_TABS.includes(tab as TabId)) {
    return tab as TabId;
  }
  return 'main';
};

function App() {
  const [activeTab, setActiveTab] = createSignal<TabId>(getInitialTab());

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    history.replaceState(null, '', `?${params.toString()}`);
  };

  onMount(() => {
    // Initialize theme listener for system preference changes
    const cleanupThemeListener = initThemeListener();
    
    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    const handlePaste = (e: ClipboardEvent) => {
      const start = selectionStart();
      if (!start) return;

      const text = e.clipboardData?.getData('text');
      if (!text) return;

      // Parse tab-separated values
      const rows = text.trim().split('\n').map((r) => r.split('\t'));

      // Apply to the appropriate table based on tableId
      if (start.tableId === 'torque') {
        rows.forEach((row, rowOffset) => {
          row.forEach((value, colOffset) => {
            const targetRow = start.row + rowOffset;
            const targetCol = start.col + colOffset;

            if (targetRow < torqueRpmData.length && targetCol < 2) {
              const numValue = parseFloat(value) || 0;
              if (targetCol === 0) {
                setTorqueRpmData(targetRow, 'torque', numValue);
              } else {
                setTorqueRpmData(targetRow, 'rpm', numValue);
              }
            }
          });
        });
        e.preventDefault();
      } else if (start.tableId === 'gears') {
        rows.forEach((row, rowOffset) => {
          const targetRow = start.row + rowOffset;
          if (targetRow < gearRatios.length && row[0]) {
            setGearRatios(targetRow, 'ratio', parseFloat(row[0]) || 0);
          }
        });
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      cleanupThemeListener();
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

  return (
    <div class="min-h-screen p-2 sm:p-4 lg:p-6 font-mono flex justify-center">
      <div class="w-full max-w-full lg:max-w-7xl">
        <DashboardHeader />

        <TabMenu activeTab={activeTab()} onTabChange={handleTabChange} />

        <Switch>
          <Match when={activeTab() === 'main'}>
            <InputTab />
          </Match>
          <Match when={activeTab() === 'suspension'}>
            <SuspensionTab />
          </Match>
          <Match when={activeTab() === 'gearbox'}>
            <GearboxTab />
          </Match>
          <Match when={activeTab() === 'data'}>
            <DatabaseTab />
          </Match>
          <Match when={activeTab() === 'map'}>
            <MapTab />
          </Match>
        </Switch>

        {/* Footer */}
        <footer class="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-muted text-[10px] sm:text-xs">
          <span class="text-foreground-secondary">{'///'}</span>
          <span>GEARX SUSPENSION CALCULATOR v1.0.0</span>
          <span class="text-foreground-secondary">{'///'}</span>
        </footer>
      </div>

    </div>
  );
}

export default App;
