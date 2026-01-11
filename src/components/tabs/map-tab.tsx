import { createSignal, For, Show } from 'solid-js';
import { GameMap } from '../ui/game-map';
import { MapSelector } from '../ui/map-selector';
import { SectionHeader } from '../ui/section-header';
import type { Landmark, GameMapConfig } from '../../types/map';

// ============================================================
// MAP DATA CONFIGURATION - Edit this to customize your maps
// ============================================================

const GAME_MAPS: GameMapConfig[] = [
  {
    id: 'downtown',
    name: 'Downtown',
    thumbnailUrl: '', // Add thumbnail URL here
    imageUrl: '', // Add full map image URL here
    bounds: [1000, 1000],
    landmarks: [
      {
        id: 'downtown-spawn',
        name: 'Central Plaza',
        position: [500, 500],
        description: 'Main spawn point in the city center. Popular meetup spot.',
        category: 'Spawn',
      },
      {
        id: 'downtown-drift-1',
        name: 'Highway Overpass',
        position: [750, 300],
        description: 'Long sweeping curves perfect for high-speed drifts.',
        category: 'Drift Zone',
      },
      {
        id: 'downtown-race-1',
        name: 'Street Circuit',
        position: [300, 700],
        description: 'Technical street circuit through narrow alleys.',
        category: 'Race Track',
      },
    ],
  },
  {
    id: 'mountain',
    name: 'Mountain Pass',
    thumbnailUrl: '', // Add thumbnail URL here
    imageUrl: '', // Add full map image URL here
    bounds: [1000, 1000],
    landmarks: [
      {
        id: 'mountain-spawn',
        name: 'Summit Parking',
        position: [800, 500],
        description: 'Starting point at the mountain peak.',
        category: 'Spawn',
      },
      {
        id: 'mountain-drift-1',
        name: 'Hairpin Heaven',
        position: [600, 400],
        description: 'Series of tight hairpins descending the mountain.',
        category: 'Drift Zone',
      },
      {
        id: 'mountain-landmark-1',
        name: 'Scenic Overlook',
        position: [400, 600],
        description: 'Beautiful viewpoint. Great for photo ops.',
        category: 'Landmark',
      },
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    thumbnailUrl: '', // Add thumbnail URL here
    imageUrl: '', // Add full map image URL here
    bounds: [1000, 1000],
    landmarks: [
      {
        id: 'industrial-spawn',
        name: 'Warehouse District',
        position: [500, 200],
        description: 'Spawn near the abandoned warehouses.',
        category: 'Spawn',
      },
      {
        id: 'industrial-drift-1',
        name: 'Container Yard',
        position: [300, 600],
        description: 'Wide open space between shipping containers.',
        category: 'Drift Zone',
      },
    ],
  },
  {
    id: 'coastal',
    name: 'Coastal Highway',
    thumbnailUrl: '', // Add thumbnail URL here
    imageUrl: '', // Add full map image URL here
    bounds: [1000, 1000],
    landmarks: [
      {
        id: 'coastal-spawn',
        name: 'Beach Parking',
        position: [200, 500],
        description: 'Oceanfront spawn with beach access.',
        category: 'Spawn',
      },
      {
        id: 'coastal-race-1',
        name: 'Seaside Sprint',
        position: [500, 700],
        description: 'Fast coastal road with ocean views.',
        category: 'Race Track',
      },
    ],
  },
];

// ============================================================
// END OF CONFIGURATION
// ============================================================

// Get unique categories for legend
const getCategories = (landmarks: Landmark[]): string[] => {
  const categories = new Set<string>();
  landmarks.forEach((l) => {
    if (l.category) categories.add(l.category);
  });
  return Array.from(categories);
};

export function MapTab() {
  const [selectedMap, setSelectedMap] = createSignal<GameMapConfig | null>(null);
  const [selectedLandmark, setSelectedLandmark] = createSignal<Landmark | null>(null);

  const handleMapSelect = (map: GameMapConfig) => {
    setSelectedMap(map);
    setSelectedLandmark(null);
  };

  const handleBack = () => {
    setSelectedMap(null);
    setSelectedLandmark(null);
  };

  const handleLandmarkClick = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

  const getLandmarksByCategory = (category: string): Landmark[] => {
    const map = selectedMap();
    if (!map) return [];
    return map.landmarks.filter((l) => l.category === category);
  };

  return (
    <div class="space-y-4">
      <Show
        when={selectedMap()}
        fallback={
          <>
            {/* Map Selection View */}
            <SectionHeader title="Select Map" />
            <div class="border border-neutral-800/50 bg-neutral-950/50 p-4">
              <MapSelector maps={GAME_MAPS} onSelect={handleMapSelect} />
            </div>
          </>
        }
      >
        {(map) => {
          const categories = () => getCategories(map().landmarks);

          return (
            <>
              {/* Map Detail View */}
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  class="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <SectionHeader title={map().name} />
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                {/* Map Container */}
                <div class="border border-neutral-800/50 bg-neutral-950/50 p-4">
                  <div class="max-w-[600px] mx-auto">
                    <GameMap
                      config={map()}
                      onLandmarkClick={handleLandmarkClick}
                      selectedLandmark={selectedLandmark()}
                    />
                  </div>
                  <p class="text-xs text-neutral-600 text-center mt-2">
                    Click and drag to pan. Click markers to view details.
                  </p>
                </div>

                {/* Legend Sidebar */}
                <div class="border border-neutral-800/50 bg-neutral-950/50 p-4 space-y-4">
                  <h3 class="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                    Legend
                  </h3>

                  <For each={categories()}>
                    {(category) => (
                      <div class="space-y-2">
                        <h4 class="text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-neutral-500" />
                          {category}
                        </h4>
                        <ul class="space-y-1 pl-4">
                          <For each={getLandmarksByCategory(category)}>
                            {(landmark) => (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setSelectedLandmark(landmark)}
                                  class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors text-left w-full"
                                  classList={{
                                    'text-neutral-200': selectedLandmark()?.id === landmark.id,
                                  }}
                                >
                                  {landmark.name}
                                </button>
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    )}
                  </For>

                  {/* Selected Landmark Info */}
                  <Show when={selectedLandmark()}>
                    {(landmark) => (
                      <div class="mt-4 pt-4 border-t border-neutral-800">
                        <h4 class="text-sm font-semibold text-neutral-200 mb-1">
                          {landmark().name}
                        </h4>
                        <Show when={landmark().category}>
                          <span class="text-[10px] uppercase tracking-wider text-neutral-500 block mb-2">
                            {landmark().category}
                          </span>
                        </Show>
                        <p class="text-xs text-neutral-400 leading-relaxed">
                          {landmark().description}
                        </p>
                      </div>
                    )}
                  </Show>
                </div>
              </div>
            </>
          );
        }}
      </Show>
    </div>
  );
}
