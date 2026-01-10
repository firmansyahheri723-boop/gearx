import { Component, onMount, onCleanup, createSignal, Match, Switch } from 'solid-js';
import { DashboardHeader } from './components/dashboard-header';
import { TabMenu, type TabId } from './components/ui/tab-menu';
import { MainTab } from './components/tabs/main-tab';
import { SuspensionTab } from './components/tabs/suspension-tab';
import { GearboxTab } from './components/tabs/gearbox-tab';
import { DataTab } from './components/tabs/data-tab';
import { ToasterWithStyles } from './components/ui/toast';
import {
  setIsSelecting,
  selectionStart,
  clearSelection,
} from './stores/selection';
import { torqueRpmData, setTorqueRpmData, gearRatios, setGearRatios } from './stores/vehicle';

const App: Component = () => {
  const [activeTab, setActiveTab] = createSignal<TabId>('main');

  onMount(() => {
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
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

  return (
    <div class="min-h-screen p-4 lg:p-6 font-mono flex justify-center">
      <div class="w-full max-w-7xl">
        <DashboardHeader />

        <TabMenu activeTab={activeTab()} onTabChange={setActiveTab} />

        <Switch>
          <Match when={activeTab() === 'main'}>
            <MainTab />
          </Match>
          <Match when={activeTab() === 'suspension'}>
            <SuspensionTab />
          </Match>
          <Match when={activeTab() === 'gearbox'}>
            <GearboxTab />
          </Match>
          <Match when={activeTab() === 'data'}>
            <DataTab />
          </Match>
        </Switch>

        {/* Footer */}
        <footer class="mt-6 flex items-center justify-center gap-2 text-slate-700 text-xs">
          <span class="text-slate-600">{'///'}</span>
          <span>GEARX SUSPENSION CALCULATOR v1.0.0</span>
          <span class="text-slate-600">{'///'}</span>
        </footer>
      </div>

      {/* Toast notifications */}
      <ToasterWithStyles />
    </div>
  );
};

export default App;
