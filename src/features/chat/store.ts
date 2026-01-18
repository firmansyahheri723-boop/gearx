import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

const CHAT_MODEL_KEY = "gearx_chat_model";

export const [apiKey, setApiKey] = createSignal<string>("");

const defaultModel = "anthropic/claude-3-5-sonnet-20241022";

const deserializeModel = (value: string | null): string => {
	return value || defaultModel;
};

export const [selectedModel, setSelectedModel] = makePersisted(
	createSignal<string>(defaultModel),
	{ name: CHAT_MODEL_KEY, deserialize: deserializeModel },
);
