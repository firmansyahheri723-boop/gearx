import { createSignal, For, type JSX, Show } from "solid-js";

type QuickPrompt = {
	label: string;
	prompt: string;
};

const QUICK_PROMPTS: QuickPrompt[] = [
	{
		label: "Explain suspension",
		prompt:
			"Explain the suspension calculator and what each setting does in CarX Street.",
	},
	{
		label: "Gear ratios help",
		prompt:
			"How do I optimize my gear ratios for maximum acceleration in CarX Street?",
	},
	{
		label: "Tune for drift",
		prompt:
			"What suspension settings should I use for drifting in CarX Street?",
	},
	{
		label: "Aero setup",
		prompt:
			"Explain how aerodynamics affect car performance and what values I should use.",
	},
];

type ChatInputProps = {
	onSend: (message: string) => void;
	disabled?: boolean;
	error?: string | null;
	class?: string;
};

export function ChatInput(props: ChatInputProps) {
	const [input, setInput] = createSignal("");
	let textareaRef: HTMLTextAreaElement | undefined;

	const handleSubmit = () => {
		const message = input().trim();
		if (message && !props.disabled) {
			props.onSend(message);
			setInput("");
			if (textareaRef) {
				textareaRef.style.height = "auto";
			}
		}
	};

	const handleKeyDown: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> = (
		e,
	) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent> = (
		e,
	) => {
		setInput(e.currentTarget.value);
		// Auto-resize textarea
		e.currentTarget.style.height = "auto";
		e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 150)}px`;
	};

	const handleQuickPrompt = (prompt: string) => {
		if (!props.disabled) {
			props.onSend(prompt);
		}
	};

	return (
		<div class={`border-t border-border/50 ${props.class ?? ""}`}>
			<Show when={props.error}>
				<div class="px-4 py-2 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm">
					{props.error}
				</div>
			</Show>

			<div class="p-4">
				<div class="flex gap-2">
					<textarea
						ref={textareaRef}
						value={input()}
						onInput={handleInput}
						onKeyDown={handleKeyDown}
						placeholder="Ask about CarX Street tuning..."
						disabled={props.disabled}
						rows={1}
						class="flex-1 px-3 py-2 bg-surface-elevated/40 text-foreground text-sm placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-foreground/50 transition-colors disabled:opacity-50"
					/>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={props.disabled || !input().trim()}
						class="px-4 py-2 bg-foreground/10 text-foreground text-sm font-medium transition-colors hover:bg-foreground/20 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Send
					</button>
				</div>

				{/* Quick prompts below textarea */}
				<div class="flex flex-wrap gap-2 mt-3">
					<For each={QUICK_PROMPTS}>
						{(prompt) => (
							<button
								type="button"
								onClick={() => handleQuickPrompt(prompt.prompt)}
								disabled={props.disabled}
								class="px-2 py-1 text-xs bg-surface/50 text-muted border border-border/30 transition-colors hover:bg-surface-elevated/50 hover:text-foreground-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								{prompt.label}
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	);
}
