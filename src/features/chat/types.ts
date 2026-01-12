export type ChatMessage = {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	reasoning?: string;
	timestamp: number;
};

export type OpenRouterModel = {
	id: string;
	name: string;
	created: number;
	description: string;
	context_length: number;
	architecture: {
		modality: string;
		input_modalities: string[];
		output_modalities: string[];
		tokenizer: string;
		instruct_type: string | null;
	};
	pricing: {
		prompt: string;
		completion: string;
		request: string;
		image: string;
	};
	top_provider: {
		context_length: number;
		max_completion_tokens: number;
		is_moderated: boolean;
	};
};

export type OpenRouterModelsResponse = {
	data: OpenRouterModel[];
};

export type ChatProvider = {
	id: string;
	name: string;
	models: { id: string; name: string }[];
};
