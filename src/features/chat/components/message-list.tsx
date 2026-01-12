import remarkGfm from "remark-gfm";
import { createEffect, createSignal, For, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import type { ChatMessage } from "@/types";

type MessageListProps = {
	messages: ChatMessage[];
	isLoading?: boolean;
	class?: string;
};

function ReasoningSection(props: { reasoning: string; isComplete: boolean }) {
	const [isExpanded, setIsExpanded] = createSignal(true);

	createEffect(() => {
		if (props.isComplete) {
			setIsExpanded(false);
		}
	});

	return (
		<div class="mt-2 mb-2">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded())}
				class="text-xs text-muted hover:text-foreground-secondary flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
			>
				<span
					class="inline-block transition-transform"
					classList={{ "rotate-90": isExpanded() }}
				>
					▶
				</span>
				[thinking... {isExpanded() ? "hide" : "show"}]
			</button>
			<Show when={isExpanded()}>
				<div class="mt-1 ml-4 text-xs text-muted/70 font-mono whitespace-pre-wrap border-l-2 border-muted/30 pl-2">
					<SolidMarkdown remarkPlugins={[remarkGfm]}>
						{props.reasoning}
					</SolidMarkdown>
				</div>
			</Show>
		</div>
	);
}

export function MessageList(props: MessageListProps) {
	let containerRef: HTMLDivElement | undefined;

	// Auto-scroll to bottom when messages change or content updates
	createEffect(() => {
		// Track both message count and last message content for streaming updates
		const lastMsg = props.messages[props.messages.length - 1];
		const _ = props.messages.length + (lastMsg?.content?.length ?? 0);
		if (containerRef) {
			// Use requestAnimationFrame to ensure DOM has updated
			requestAnimationFrame(() => {
				if (containerRef) {
					containerRef.scrollTo({
						top: containerRef.scrollHeight,
						behavior: "smooth",
					});
				}
			});
		}
	});

	return (
		<div
			ref={containerRef}
			class={`flex-1 overflow-y-auto space-y-4 p-4 ${props.class ?? ""}`}
		>
			<Show
				when={props.messages.length > 0}
				fallback={
					<div class="h-full flex items-center justify-center text-muted text-sm">
						Start a conversation...
					</div>
				}
			>
				<For each={props.messages}>
					{(message) => (
						<div
							class="flex"
							classList={{
								"justify-end": message.role === "user",
								"justify-start": message.role === "assistant",
							}}
						>
							<div
								class="max-w-[60%] px-3 py-2 text-sm break-words"
								classList={{
									"bg-foreground/10 text-foreground whitespace-pre-wrap":
										message.role === "user",
									"bg-surface-elevated/50 text-foreground-secondary prose prose-sm prose-invert":
										message.role === "assistant",
								}}
							>
								<Show when={message.role === "assistant" && message.reasoning}>
									<ReasoningSection
										reasoning={message.reasoning!}
										isComplete={
											!props.isLoading ||
											message !== props.messages[props.messages.length - 1]
										}
									/>
								</Show>
								<Show
									when={message.role === "assistant"}
									fallback={message.content}
								>
									<SolidMarkdown remarkPlugins={[remarkGfm]}>
										{message.content}
									</SolidMarkdown>
								</Show>
								<Show
									when={
										message.role === "assistant" &&
										props.isLoading &&
										message === props.messages[props.messages.length - 1]
									}
								>
									<span class="inline-block w-2 h-4 ml-1 bg-foreground/50 animate-pulse" />
								</Show>
							</div>
						</div>
					)}
				</For>
			</Show>

			<Show
				when={
					props.isLoading &&
					(props.messages.length === 0 ||
						props.messages[props.messages.length - 1]?.role !== "assistant")
				}
			>
				<div class="flex justify-start">
					<div class="bg-surface-elevated/50 text-foreground-secondary px-3 py-2 text-sm">
						<span class="inline-flex gap-1">
							<span
								class="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
								style={{ "animation-delay": "0ms" }}
							/>
							<span
								class="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
								style={{ "animation-delay": "150ms" }}
							/>
							<span
								class="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
								style={{ "animation-delay": "300ms" }}
							/>
						</span>
					</div>
				</div>
			</Show>
		</div>
	);
}
