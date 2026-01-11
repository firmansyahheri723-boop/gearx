import { createFileRoute } from "@tanstack/solid-router";
import { Show, createMemo } from "solid-js";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { SectionHeader } from "../components/ui/section-header";
import { ApiKeyInput } from "../components/ui/chat/api-key-input";
import { InferenceSelector } from "../components/ui/chat/inference-selector";
import { MessageList } from "../components/ui/chat/message-list";
import { ChatInput } from "../components/ui/chat/chat-input";
import {
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  messages,
  addMessage,
  updateMessage,
  updateMessageReasoning,
  clearMessages,
  isLoading,
  setIsLoading,
  error,
  setError,
} from "../stores/chat";
import {
  vehicleInputs,
  gearRatios,
  finalDrive,
  tireCompound,
  aeroSettings,
} from "../stores/vehicle";
import systemPrompt from "../constants/prompt.md?raw";

export const Route = createFileRoute("/chat")({
  component: Chat,
});

function buildSystemContext(): string {
  const currentSetup = {
    vehicle: {
      weight: vehicleInputs.weight,
      frontWeightDistribution: vehicleInputs.frontWeightDistribution,
      drivetrain: vehicleInputs.drivetrain,
      wheelbase: vehicleInputs.wheelbase,
      cogHeight: vehicleInputs.cogHeight,
    },
    suspension: {
      desiredRideFrequency: vehicleInputs.desiredRideFrequency,
      desiredRollGradient: vehicleInputs.desiredRollGradient,
      dampingRatio: vehicleInputs.dampingRatio,
    },
    gearbox: {
      gearRatios: gearRatios
        .map((g, i) => ({ gear: i + 1, ratio: g.ratio }))
        .filter((g) => g.ratio > 0),
      finalDrive: finalDrive.ratio,
      tireCompound: tireCompound.value,
    },
    aero: {
      frontAero: aeroSettings.frontAero,
      rearAero: aeroSettings.rearAero,
      airResistance: aeroSettings.airResistance,
    },
  };

  return systemPrompt.replaceAll(
    "@setup",
    JSON.stringify(currentSetup, null, 2),
  );
}

function Chat() {
  const hasApiKey = createMemo(() => apiKey().trim().length > 0);

  const handleSend = async (userMessage: string) => {
    if (!hasApiKey() || isLoading()) return;

    setError(null);
    setIsLoading(true);

    addMessage({ role: "user", content: userMessage });

    const assistantMsg = addMessage({ role: "assistant", content: "" });

    try {
      const openrouter = createOpenRouter({
        apiKey: apiKey(),
      });

      const systemContext = buildSystemContext();
      const conversationHistory = messages
        .filter((m) => m.id !== assistantMsg.id)
        .map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

      const result = streamText({
        model: openrouter(selectedModel()),
        system: systemContext,
        messages: conversationHistory,
      });

      let fullContent = "";
      let fullReasoning = "";
      for await (const part of result.fullStream) {
        if (part.type === 'text') {
          fullContent += part.text;
          updateMessage(assistantMsg.id, fullContent);
        } else if (part.type === 'reasoning') {
          fullReasoning += part.text;
          updateMessageReasoning(assistantMsg.id, fullReasoning);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      updateMessage(
        assistantMsg.id,
        "Sorry, an error occurred. Please check your API key and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      class="border border-border/50 bg-background/50 flex flex-col"
      style={{ height: "calc(100vh - 220px)", "min-height": "400px" }}
    >
      <SectionHeader title="AI Tuning Assistant" variant="input" />

      <div class="p-4 border-b border-border/50 bg-surface/30">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-[10px] uppercase tracking-wider text-muted mb-1">
              OpenRouter API Key
              <ApiKeyInput
                value={apiKey()}
                onChange={setApiKey}
                placeholder="sk-or-..."
              />
            </label>
          </div>
          <div class="w-full sm:w-auto sm:min-w-[400px]">
            <label class="block text-[10px] uppercase tracking-wider text-muted mb-1">
              Inference Provider
              <InferenceSelector
                value={selectedModel()}
                onChange={setSelectedModel}
              />
            </label>
          </div>
          <Show when={messages.length > 0}>
            <div class="flex items-end">
              <button
                type="button"
                onClick={clearMessages}
                class="px-3 py-2 text-xs text-muted hover:text-foreground border border-border/50 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </Show>
        </div>

        <Show when={!hasApiKey()}>
          <div class="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            Enter your OpenRouter API key to start chatting. Get one at{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-amber-300"
            >
              openrouter.ai/keys
            </a>
          </div>
        </Show>
      </div>

      <MessageList
        messages={[...messages]}
        isLoading={isLoading()}
        class="flex-1"
      />

      <ChatInput
        onSend={handleSend}
        disabled={!hasApiKey() || isLoading()}
        error={error()}
      />
    </div>
  );
}
