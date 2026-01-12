import { createSignal } from "solid-js";

export const [apiKey, setApiKey] = createSignal<string>("");
export const [selectedModel, setSelectedModel] = createSignal<string>(
	"anthropic/claude-3-5-sonnet-20241022",
);
