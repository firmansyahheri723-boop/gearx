import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ChatMessage } from '../types';

const MODEL_STORAGE_KEY = 'gearx-chat-model';

const DEFAULT_MODEL = 'z-ai/glm-4.7';

const getInitialModel = (): string => {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  return localStorage.getItem(MODEL_STORAGE_KEY) ?? DEFAULT_MODEL;
};

const saveModel = (modelId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODEL_STORAGE_KEY, modelId);
};

export const [selectedModel, setSelectedModelInternal] = createSignal<string>(getInitialModel());

export const setSelectedModel = (modelId: string) => {
  setSelectedModelInternal(modelId);
  saveModel(modelId);
};

export const [apiKey, setApiKey] = createSignal<string>('');

export const [messages, setMessages] = createStore<ChatMessage[]>([]);

export const [isLoading, setIsLoading] = createSignal<boolean>(false);

export const [error, setError] = createSignal<string | null>(null);

export const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const newMessage: ChatMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  setMessages((msgs) => [...msgs, newMessage]);
  return newMessage;
};

export const updateMessage = (id: string, content: string) => {
  setMessages(
    (msg) => msg.id === id,
    'content',
    content
  );
};

export const updateMessageReasoning = (id: string, reasoning: string) => {
  setMessages(
    (msg) => msg.id === id,
    'reasoning',
    reasoning
  );
};

export const clearMessages = () => {
  setMessages([]);
  setError(null);
};
