export type Landmark = {
	id: string;
	name: string;
	position: [number, number];
	description: string;
	imageUrl?: string;
	category?: string;
};

export type GameMapConfig = {
	id: string;
	name: string;
	thumbnailUrl: string;
	imageUrl: string;
	bounds: [number, number];
	landmarks: Landmark[];
};
