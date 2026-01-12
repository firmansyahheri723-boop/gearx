import type { OpenRouterModel, OpenRouterModelsResponse, ChatProvider } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models';

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const response = await fetch(OPENROUTER_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  const data: OpenRouterModelsResponse = await response.json();
  return data.data;
}

// Extract provider ID from model ID (e.g., "openai/gpt-4o" -> "openai")
export function getProviderIdFromModelId(modelId: string): string {
  return modelId.split('/')[0];
}

// Format provider ID to readable name (e.g., "meta-llama" -> "Meta Llama")
function formatProviderName(providerId: string): string {
  return providerId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Group models by provider
export function groupModelsByProvider(models: OpenRouterModel[]): ChatProvider[] {
  const providerMap = new Map<string, { id: string; name: string; models: { id: string; name: string }[] }>();

  for (const model of models) {
    const providerId = getProviderIdFromModelId(model.id);
    
    if (!providerMap.has(providerId)) {
      providerMap.set(providerId, {
        id: providerId,
        name: formatProviderName(providerId),
        models: [],
      });
    }

    providerMap.get(providerId)!.models.push({
      id: model.id,
      name: model.name,
    });
  }

  // Sort providers alphabetically
  return Array.from(providerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Get all unique providers from models
export function getProviders(models: OpenRouterModel[]): { id: string; name: string }[] {
  const providers = groupModelsByProvider(models);
  return providers.map(p => ({ id: p.id, name: p.name }));
}

// Get models for a specific provider
export function getModelsForProvider(models: OpenRouterModel[], providerId: string): { id: string; name: string }[] {
  const filtered = models.filter(m => getProviderIdFromModelId(m.id) === providerId);
  return filtered.map(m => ({ id: m.id, name: m.name }));
}
