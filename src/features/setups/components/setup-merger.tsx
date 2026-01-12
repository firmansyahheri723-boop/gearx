import { createSignal, For, Show, createMemo } from 'solid-js';
import { getSetups, getSetupById, createSetup } from '../store';
import type { SavedSetup, SetupDiffField } from '../../../types';
import { compareTwoSetups } from '../utils/setup-compare';
import { SetupSaveDialog } from './setup-save-dialog';
import { SetupTag } from './setup-tag';

interface SetupMergerProps {
  onClose: () => void;
  onCreated: () => void;
}

export function SetupMerger(props: SetupMergerProps) {
  const [setupAId, setSetupAId] = createSignal<string>('');
  const [setupBId, setSetupBId] = createSignal<string>('');
  const [selectedFields, setSelectedFields] = createSignal<Set<string>>(new Set());
  const [newSetupName, setNewSetupName] = createSignal('');
  const [showSaveDialog, setShowSaveDialog] = createSignal(false);

  const allSetups = getSetups();
  const selectedSetupA = createMemo(() => getSetupById(setupAId()));
  const selectedSetupB = createMemo(() => getSetupById(setupBId()));

  const comparisonDiff = createMemo(() => {
    const a = selectedSetupA();
    const b = selectedSetupB();
    if (!a || !b) return null;
    return compareTwoSetups(a, b);
  });

  const allDiffs = createMemo(() => {
    const diff = comparisonDiff();
    if (!diff) return [];
    return diff.categories.flatMap((cat) => cat.fields);
  });

  const toggleField = (path: string) => {
    const current = selectedFields();
    const updated = new Set(current);
    if (updated.has(path)) {
      updated.delete(path);
    } else {
      updated.add(path);
    }
    setSelectedFields(updated);
  };

  const selectAllInCategory = (category: string) => {
    const categoryDiffs = allDiffs().filter((d) => d.category === category);
    const updated = new Set(selectedFields());
    categoryDiffs.forEach((d) => updated.add(d.path));
    setSelectedFields(updated);
  };

  const deselectAllInCategory = (category: string) => {
    const categoryDiffs = allDiffs().filter((d) => d.category === category);
    const updated = new Set(selectedFields());
    categoryDiffs.forEach((d) => updated.delete(d.path));
    setSelectedFields(updated);
  };

  const handleMerge = () => {
    const a = selectedSetupA();
    const b = selectedSetupB();
    if (!a || !b) return;

    const selected = selectedFields();

    const merged = {
      ...a,
      inputs: { ...a.inputs },
    };

    allDiffs().forEach((field) => {
      if (selected.has(field.path)) {
        const parts = field.path.split('.');
        if (parts[0] === 'inputs') {
          parts.shift();
          let current: Record<string, unknown> = merged.inputs;
          for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, unknown>;
          }
          current[parts[parts.length - 1]] = field.newValue;
        } else if (parts[0] === 'torqueRpmData' || parts[0] === 'gearRatios') {
          const arrayName = parts[0] as 'torqueRpmData' | 'gearRatios';
          const index = parseInt(parts[1], 10);
          if (!Array.isArray(merged[arrayName])) {
            (merged as unknown as Record<string, unknown[]>)[arrayName] = [...(a as unknown as Record<string, unknown[]>)[arrayName]];
          }
          const item = { ...(merged as unknown as Record<string, Record<string, unknown>[]>)[arrayName][index] };
          item[parts[2]] = field.newValue;
          (merged as unknown as Record<string, Record<string, unknown>[]>)[arrayName][index] = item;
        } else if (parts[0] === 'finalDrive') {
          (merged.finalDrive as Record<string, unknown>)[parts[1]] = field.newValue;
        } else if (parts[0] === 'aeroSettings') {
          (merged.aeroSettings as Record<string, unknown>)[parts[1]] = field.newValue;
        } else if (parts[0] === 'alignmentInputs') {
          if (!merged.alignmentInputs) {
            merged.alignmentInputs = {};
          }
          (merged.alignmentInputs as Record<string, unknown>)[parts[1]] = field.newValue;
        } else if (parts.length === 1) {
          (merged as unknown as Record<string, unknown>)[parts[0]] = field.newValue;
        }
      }
    });

    const newSetup = createSetup({
      name: newSetupName() || `Merged: ${a.name} + ${b.name}`,
      description: `Hybrid setup merging ${a.name} and ${b.name}`,
      tags: [...a.tags, ...b.tags.filter((t) => !a.tags.some((at) => at.id === t.id))],
      notes: `Created from merging:\n- ${a.name}\n- ${b.name}`,
      carName: a.carName,
      inputs: merged.inputs,
      torqueRpmData: merged.torqueRpmData,
      gearRatios: merged.gearRatios,
      finalDrive: merged.finalDrive,
      tireCompound: merged.tireCompound,
      tractionMode: merged.tractionMode,
      aeroSettings: merged.aeroSettings,
      alignmentInputs: merged.alignmentInputs,
    });

    props.onCreated();
    props.onClose();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={props.onClose} />
      <div class="relative bg-surface/95 border border-border/50 shadow-2xl shadow-black/40 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-surface/95">
          <h2 class="text-sm font-bold uppercase tracking-widest text-foreground">
            Merge Setups
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

        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
                Base Setup (A)
              </label>
              <select
                value={setupAId()}
                onChange={(e) => setSetupAId(e.currentTarget.value)}
                class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
              >
                <option value="">Select setup...</option>
                <For each={allSetups}>
                  {(setup) => (
                    <option value={setup.id}>{setup.name}</option>
                  )}
                </For>
              </select>
            </div>
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
                Source Setup (B)
              </label>
              <select
                value={setupBId()}
                onChange={(e) => setSetupBId(e.currentTarget.value)}
                class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
              >
                <option value="">Select setup...</option>
                <For each={allSetups}>
                  {(setup) => (
                    <option value={setup.id}>{setup.name}</option>
                  )}
                </For>
              </select>
            </div>
          </div>

          <Show when={comparisonDiff()}>
            <div class="border border-border/50 bg-surface/50">
              <div class="px-3 py-2 border-b border-border/30 bg-surface-elevated/30">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-foreground">
                    Select Fields to Merge
                  </h3>
                  <div class="text-[10px] text-muted">
                    {selectedFields().size} selected
                  </div>
                </div>
              </div>
              <div class="divide-y divide-border/30 max-h-80 overflow-y-auto">
                <For each={comparisonDiff()?.categories}>
                  {(category) => (
                    <div class="p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-foreground">{category.label}</span>
                        <div class="flex gap-1">
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(category.name)}
                            class="text-[10px] text-muted hover:text-foreground uppercase"
                          >
                            Select All
                          </button>
                          <span class="text-muted">|</span>
                          <button
                            type="button"
                            onClick={() => deselectAllInCategory(category.name)}
                            class="text-[10px] text-muted hover:text-foreground uppercase"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div class="space-y-1">
                        <For each={category.fields}>
                          {(field) => (
                            <label class="flex items-center gap-2 p-1.5 hover:bg-surface-elevated/30 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFields().has(field.path)}
                                onChange={() => toggleField(field.path)}
                                class="w-3 h-3 border-border/50"
                              />
                              <span class="text-xs text-muted flex-1">{field.label}</span>
                              <span class="text-[10px] text-muted font-mono">
                                {field.formattedOld} → {field.formattedNew}
                              </span>
                              <div
                                class="w-1.5 h-1.5"
                                style={{
                                  'background-color':
                                    field.impact === 'high' ? '#ef4444' :
                                    field.impact === 'medium' ? '#f59e0b' : '#22c55e'
                                }}
                              />
                            </label>
                          )}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div>
              <label class="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
                New Setup Name
              </label>
              <input
                type="text"
                value={newSetupName()}
                onInput={(e) => setNewSetupName(e.currentTarget.value)}
                placeholder={`Merged: ${selectedSetupA()?.name} + ${selectedSetupB()?.name}`}
                class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                onClick={props.onClose}
                class="flex-1 px-4 py-2 border border-border/50 text-muted hover:text-foreground text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMerge}
                disabled={selectedFields().size === 0}
                class="flex-1 px-4 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary transition-colors disabled:opacity-50"
              >
                Create Merged Setup
              </button>
            </div>
          </Show>

          <Show when={!comparisonDiff()}>
            <div class="text-center py-8 text-muted text-sm">
              Select two setups to merge
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
