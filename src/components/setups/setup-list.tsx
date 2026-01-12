import { createSignal, For, Show, createMemo } from 'solid-js';
import { getFilteredSetups, getAllTags, getAllCarNames, setFilter, clearFilter, deleteSetup, duplicateSetup } from '../../stores/setups';
import type { SavedSetup, SetupTag } from '../../types';
import { SetupCard } from './setup-card';
import { SetupSaveDialog } from './setup-save-dialog';
import { exportToJSON, downloadJSON, importFromFile } from '../../utils/setup-import';

interface SetupListProps {
  onApplySetup: (setup: SavedSetup) => void;
}

export function SetupList(props: SetupListProps) {
  const [search, setSearch] = createSignal('');
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const [carFilter, setCarFilter] = createSignal<string | null>(null);
  const [sortBy, setSortBy] = createSignal<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc');
  const [editingSetup, setEditingSetup] = createSignal<{ id: string; name: string; description: string; tags: SetupTag[]; notes: string } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = createSignal(false);
  const [importing, setImporting] = createSignal(false);

  const allTags = getAllTags();
  const allCars = getAllCarNames();

  const filteredSetups = createMemo(() => {
    const setups = getFilteredSetups();
    return setups;
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilter({ search: value });
  };

  const handleTagToggle = (tagId: string) => {
    const current = selectedTagIds();
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setSelectedTagIds(updated);
    setFilter({ tags: updated });
  };

  const handleCarSelect = (car: string | null) => {
    setCarFilter(car);
    setFilter({ carFilter: car });
  };

  const handleSort = (field: 'name' | 'createdAt' | 'updatedAt') => {
    if (sortBy() === field) {
      setSortOrder(sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setFilter({ sortBy: field, sortOrder: sortOrder() });
  };

  const handleDelete = (setup: SavedSetup) => {
    if (confirm(`Delete "${setup.name}"?`)) {
      deleteSetup(setup.id);
    }
  };

  const handleDuplicate = (setup: SavedSetup) => {
    duplicateSetup(setup.id);
  };

  const handleExport = () => {
    const json = exportToJSON(filteredSetups());
    downloadJSON(filteredSetups());
  };

  const handleImport = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setImporting(true);
    const result = await importFromFile(file);

    if (!result.success) {
      alert(`Import failed: ${result.errors.map((e) => e.message).join(', ')}`);
    } else {
      alert(`Imported ${result.setups.length} setup(s)`);
    }

    setImporting(false);
    input.value = '';
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTagIds([]);
    setCarFilter(null);
    clearFilter();
  };

  return (
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            type="text"
            value={search()}
            onInput={(e) => handleSearch(e.currentTarget.value)}
            placeholder="Search setups..."
            class="w-full bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
          />
        </div>
        <div class="flex gap-2">
          <select
            value={carFilter() ?? ''}
            onChange={(e) => handleCarSelect(e.currentTarget.value || null)}
            class="bg-surface-elevated/50 border border-border/50 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50"
          >
            <option value="">All Cars</option>
            <For each={allCars}>
              {(car) => <option value={car}>{car}</option>}
            </For>
          </select>
          <button
            type="button"
            onClick={handleExport}
            class="px-3 py-2 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider"
          >
            Export
          </button>
          <label class="px-3 py-2 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider cursor-pointer">
            {importing() ? 'Importing...' : 'Import'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              class="hidden"
            />
          </label>
        </div>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <For each={allTags}>
          {(tag) => (
            <button
              type="button"
              class={`px-2 py-0.5 text-[10px] uppercase tracking-wider border transition-colors ${
                selectedTagIds().includes(tag.id)
                  ? 'border-foreground bg-foreground/10'
                  : 'border-border/30 bg-surface/50 text-muted hover:border-foreground/30'
              }`}
              onClick={() => handleTagToggle(tag.id)}
              style={{
                '--tag-color': tag.color,
                'border-color': selectedTagIds().includes(tag.id) ? tag.color : undefined,
                'background-color': selectedTagIds().includes(tag.id) ? `${tag.color}20` : undefined,
                'color': selectedTagIds().includes(tag.id) ? tag.color : undefined,
              }}
            >
              {tag.name}
            </button>
          )}
        </For>
        <Show when={selectedTagIds().length > 0 || carFilter() || search()}>
          <button
            type="button"
            onClick={handleClearFilters}
            class="px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted hover:text-foreground"
          >
            Clear
          </button>
        </Show>
      </div>

      <div class="flex items-center gap-1 text-[10px] text-muted">
        <button
          type="button"
          onClick={() => handleSort('updatedAt')}
          class={`hover:text-foreground ${sortBy() === 'updatedAt' ? 'text-foreground' : ''}`}
        >
          Updated {sortBy() === 'updatedAt' && (sortOrder() === 'desc' ? '↓' : '↑')}
        </button>
        <span class="text-muted">|</span>
        <button
          type="button"
          onClick={() => handleSort('createdAt')}
          class={`hover:text-foreground ${sortBy() === 'createdAt' ? 'text-foreground' : ''}`}
        >
          Created {sortBy() === 'createdAt' && (sortOrder() === 'desc' ? '↓' : '↑')}
        </button>
        <span class="text-muted">|</span>
        <button
          type="button"
          onClick={() => handleSort('name')}
          class={`hover:text-foreground ${sortBy() === 'name' ? 'text-foreground' : ''}`}
        >
          Name {sortBy() === 'name' && (sortOrder() === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <For each={filteredSetups()}>
          {(setup) => (
            <SetupCard
              setup={setup}
              onClick={() => {}}
              onApply={() => props.onApplySetup(setup)}
              onEdit={() => setEditingSetup(setup)}
              onDelete={() => handleDelete(setup)}
              onDuplicate={() => handleDuplicate(setup)}
            />
          )}
        </For>
      </div>

      <Show when={filteredSetups().length === 0}>
        <div class="text-center py-8 text-muted text-sm">
          {search() || selectedTagIds().length > 0 || carFilter()
            ? 'No setups match your filters'
            : 'No saved setups yet. Save your first setup!'}
        </div>
      </Show>

      <Show when={showSaveDialog()}>
        <SetupSaveDialog
          onClose={() => setShowSaveDialog(false)}
          onSave={() => {}}
        />
      </Show>

      <Show when={editingSetup()}>
        <SetupSaveDialog
          setup={editingSetup()!}
          onClose={() => setEditingSetup(null)}
          onSave={() => setEditingSetup(null)}
        />
      </Show>
    </div>
  );
}
