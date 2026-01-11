export interface Landmark {
  id: string;
  name: string;
  /** Position as [y, x] in image pixel coordinates */
  position: [number, number];
  description: string;
  /** Optional image URL for the popup */
  imageUrl?: string;
  /** Category for filtering/grouping in legend */
  category?: string;
}

export interface GameMapConfig {
  /** Unique identifier for the map */
  id: string;
  /** Display name for the map */
  name: string;
  /** Thumbnail image URL for the selection grid */
  thumbnailUrl: string;
  /** URL of the full map image (can be empty for placeholder) */
  imageUrl: string;
  /** Map dimensions in pixels [height, width] */
  bounds: [number, number];
  /** List of landmarks/hotspots on the map */
  landmarks: Landmark[];
}
