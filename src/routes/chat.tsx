import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createFileRoute } from "@tanstack/solid-router";
import { streamText } from "ai";
import { createMemo, createSignal } from "solid-js";
import { SectionHeader } from "@/components/ui/section-header";
import systemPrompt from "@/constants/prompt.md?raw";
import { aeroSettings } from "@/features/aero/store";
import { ApiKeyInput } from "@/features/chat/components/api-key-input";
import { ChatInput } from "@/features/chat/components/chat-input";
import { InferenceSelector } from "@/features/chat/components/inference-selector";
import { MessageList } from "@/features/chat/components/message-list";
import {
	apiKey,
	selectedModel,
	setApiKey,
	setSelectedModel,
} from "@/features/chat/store";
import { getSelectedCar, getSelectedEngine } from "@/features/database/store";
import { finalDrive, gearRatios, tireCompound } from "@/features/gearbox/store";
import { vehicleInputs } from "@/features/suspension/store";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/chat")({
	component: Chat,
});

function buildSystemContext(): string {
	const gearRatiosStr = gearRatios
		.map((g, i) => `${i + 1}:${g.ratio}`)
		.filter((s) => s.endsWith(":0") === false)
		.join(", ");

	const selectedCar = getSelectedCar();
	const selectedEngine = getSelectedEngine();

	const carName = selectedCar?.car || vehicleInputs.carSelection || "Unknown";
	const engineName =
		selectedEngine?.car || vehicleInputs.engineSelection || "Unknown";

	const formatNum = (
		n: number | null | undefined,
		decimals: number = 1,
	): string => {
		if (n === null || n === undefined) return "N/A";
		return n.toFixed(decimals).replace(/\.?0+$/, "");
	};

	return systemPrompt
		.replaceAll("@car_name", carName)
		.replaceAll("@model", selectedModel())
		.replaceAll("@weight", formatNum(vehicleInputs.weight))
		.replaceAll(
			"@front_weight",
			formatNum(vehicleInputs.frontWeightDistribution),
		)
		.replaceAll("@drivetrain", vehicleInputs.drivetrain)
		.replaceAll("@wheelbase", formatNum(vehicleInputs.wheelbase, 0))
		.replaceAll("@cog_height", formatNum(vehicleInputs.cogHeight, 1))
		.replaceAll("@f_track_width", formatNum(vehicleInputs.frontTrackWidth, 0))
		.replaceAll("@r_track_width", formatNum(vehicleInputs.rearTrackWidth, 0))
		.replaceAll("@f_wheel_offset", formatNum(vehicleInputs.frontWheelOffset, 1))
		.replaceAll("@r_wheel_offset", formatNum(vehicleInputs.rearWheelOffset, 1))
		.replaceAll("@engine_name", engineName)
		.replaceAll("@power", formatNum(selectedEngine?.powerHp, 0))
		.replaceAll("@engine_mass", formatNum(selectedEngine?.massKg, 0))
		.replaceAll("@rev_limiter", formatNum(selectedEngine?.revLimiter, 0))
		.replaceAll("@curve_fall", formatNum(selectedEngine?.curveFallRpm, 0))
		.replaceAll("@turbo_press", formatNum(selectedEngine?.turboPress, 2))
		.replaceAll("@inertia_ratio", formatNum(selectedEngine?.inertiaRatio, 2))
		.replaceAll("@gears", formatNum(selectedCar?.gears, 0))
		.replaceAll("@shift_time", formatNum(selectedCar?.shiftTime, 2))
		.replaceAll("@ride_freq", formatNum(vehicleInputs.desiredRideFrequency, 2))
		.replaceAll("@roll_grad", formatNum(vehicleInputs.desiredRollGradient, 2))
		.replaceAll("@damping", formatNum(vehicleInputs.dampingRatio, 2))
		.replaceAll("@gear_ratios", gearRatiosStr)
		.replaceAll("@final_drive", formatNum(finalDrive.ratio, 2))
		.replaceAll("@tire_compound", tireCompound.value)
		.replaceAll("@front_aero", formatNum(aeroSettings.frontAero, 0))
		.replaceAll("@rear_aero", formatNum(aeroSettings.rearAero, 0))
		.replaceAll("@air_resistance", formatNum(aeroSettings.airResistance, 2));
}

function Chat() {
	const [messages, setMessages] = createSignal<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const hasApiKey = createMemo(() => apiKey().trim().length > 0);

	const sendMessage = async (userMessage: string) => {
		if (!hasApiKey() || isLoading()) return;

		setIsLoading(true);
		setError(null);

		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: userMessage,
			timestamp: Date.now(),
		};
		const assistantMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			content: "",
			timestamp: Date.now(),
		};

		setMessages((msgs) => [...msgs, userMsg, assistantMsg]);

		try {
			const openrouter = createOpenRouter({
				apiKey: apiKey(),
			});

			const systemContext = buildSystemContext();
			const conversationHistory = messages()
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
				if (part.type === "text-delta") {
					fullContent += part.text;
					setMessages((msgs) =>
						msgs.map((m) =>
							m.id === assistantMsg.id ? { ...m, content: fullContent } : m,
						),
					);
				} else if (part.type === "reasoning-delta") {
					fullReasoning += part.text;
					setMessages((msgs) =>
						msgs.map((m) =>
							m.id === assistantMsg.id ? { ...m, reasoning: fullReasoning } : m,
						),
					);
				}
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An error occurred";
			setError(errorMessage);
			setMessages((msgs) =>
				msgs.map((m) =>
					m.id === assistantMsg.id
						? {
								...m,
								content:
									"Sorry, an error occurred. Please check your API key and try again.",
							}
						: m,
				),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const clearMessages = () => {
		setMessages([]);
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
					{messages().length > 0 && (
						<div class="flex items-end">
							<button
								type="button"
								onClick={clearMessages}
								class="px-3 py-2 text-xs text-muted hover:text-foreground border border-border/50 transition-colors"
							>
								Clear Chat
							</button>
						</div>
					)}
				</div>

				{!hasApiKey() && (
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
				)}
			</div>

			<MessageList
				messages={messages()}
				isLoading={isLoading()}
				class="flex-1"
			/>

			<ChatInput
				onSend={sendMessage}
				disabled={!hasApiKey() || isLoading()}
				error={error()}
			/>
		</div>
	);
}
