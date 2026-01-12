import { onMount, onCleanup, createEffect } from 'solid-js';
import L from 'leaflet';
import type { Landmark, GameMapConfig } from '@/types/map';

type GameMapProps = {
  config: GameMapConfig;
  onLandmarkClick?: (landmark: Landmark) => void;
  selectedLandmark?: Landmark | null;
}

export function GameMap(props: GameMapProps) {
  let containerRef: HTMLDivElement | undefined;
  let map: L.Map | null = null;
  let markers: L.Marker[] = [];

  const createPopupContent = (landmark: Landmark): string => {
    const imageHtml = landmark.imageUrl
      ? `<img src="${landmark.imageUrl}" alt="${landmark.name}" class="w-full h-32 object-cover rounded mb-2" />`
      : '';

    return `
      <div class="min-w-[200px] max-w-[280px]">
        ${imageHtml}
        <h3 class="font-semibold text-sm text-foreground mb-1">${landmark.name}</h3>
        ${landmark.category ? `<span class="text-[10px] uppercase tracking-wider text-muted mb-2 block">${landmark.category}</span>` : ''}
        <p class="text-xs text-foreground-secondary leading-relaxed">${landmark.description}</p>
      </div>
    `;
  };

  const initMap = () => {
    if (!containerRef) return;

    const [height, width] = props.config.bounds;

    // Create map with simple CRS for image coordinates
    map = L.map(containerRef, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 0, // Fixed zoom level
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      attributionControl: false,
    });

    const bounds: L.LatLngBoundsExpression = [[0, 0], [height, width]];

    // Add image overlay if URL is provided
    if (props.config.imageUrl) {
      L.imageOverlay(props.config.imageUrl, bounds).addTo(map);
    } else {
      // Add a placeholder rectangle when no image
      L.rectangle(bounds, {
        color: '#404040',
        weight: 2,
        fillColor: '#262626',
        fillOpacity: 1,
      }).addTo(map);

      // Add placeholder text
      const center = L.latLng(height / 2, width / 2);
      L.marker(center, {
        icon: L.divIcon({
          className: 'placeholder-text',
          html: '<div class="text-muted text-sm font-mono whitespace-nowrap">Map image placeholder</div>',
          iconSize: [150, 20],
          iconAnchor: [75, 10],
        }),
      }).addTo(map);
    }

    // Set view to center of map
    map.setView([height / 2, width / 2], 0);
    map.setMaxBounds(bounds);

    // Add landmarks as markers
    addMarkers();
  };

  const addMarkers = () => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((m) => m.remove());
    markers = [];

    for (const landmark of props.config.landmarks) {
      const marker = L.marker(landmark.position, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="w-6 h-6 bg-surface-elevated border-2 border-border rounded-full flex items-center justify-center cursor-pointer hover:border-foreground hover:bg-surface-elevated transition-colors">
              <div class="w-2 h-2 bg-foreground-secondary rounded-full"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        }),
      });

      marker.bindPopup(createPopupContent(landmark), {
        className: 'custom-popup',
        maxWidth: 300,
        minWidth: 200,
      });

      marker.on('click', () => {
        props.onLandmarkClick?.(landmark);
      });

      marker.addTo(map!);
      markers.push(marker);
    }
  };

  // Re-add markers when landmarks change
  createEffect(() => {
    // Access landmarks to track changes
    props.config.landmarks;
    if (map) {
      addMarkers();
    }
  });

  // Open popup when selected landmark changes
  createEffect(() => {
    const selected = props.selectedLandmark;
    if (selected && map) {
      const marker = markers.find((_, idx) => props.config.landmarks[idx]?.id === selected.id);
      if (marker) {
        marker.openPopup();
        map.panTo(selected.position);
      }
    }
  });

  onMount(() => {
    initMap();
  });

  onCleanup(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  return (
    <div
      ref={containerRef}
      class="w-full aspect-square bg-surface border border-border"
    />
  );
}
