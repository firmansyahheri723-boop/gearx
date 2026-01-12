import { For } from "solid-js";
import type { GameMapConfig } from "@/types/map";

type MapSelectorProps = {
  maps: GameMapConfig[];
  onSelect: (map: GameMapConfig) => void;
}

export function MapSelector(props: MapSelectorProps) {
  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <For each={props.maps}>
        {(map) => (
          <button
            type="button"
            onClick={() => props.onSelect(map)}
            class="cursor-pointer group flex flex-col items-center gap-2 p-2 border border-border/50 bg-background/50 hover:border-border hover:bg-surface/50 transition-colors"
          >
            {/* Thumbnail */}
            <div class="w-full aspect-square bg-surface border border-border overflow-hidden">
              {map.thumbnailUrl ? (
                <img
                  src={map.thumbnailUrl}
                  alt={map.name}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div class="w-full h-full flex items-center justify-center text-muted">
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Name */}
            <span class="text-xs text-muted group-hover:text-foreground transition-colors uppercase tracking-wider">
              {map.name}
            </span>
          </button>
        )}
      </For>
    </div>
  );
}
