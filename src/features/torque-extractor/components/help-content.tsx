import {
	type Component,
	createSignal,
	onCleanup,
	onMount,
	Show,
} from "solid-js";

const HELP_STEPS = [
	{
		number: 1,
		title: "Capture Your Chart",
		content: `Take a clear screenshot of the torque curve graph. Make sure:
• The entire curve is visible, including both axis lines
• The RPM and torque values are readable (no blur)
• The graph is not cropped or cut off
• No overlays are covering important data points`,
	},
	{
		number: 2,
		title: "Set the Boundaries",
		content: `Drag the four corner markers to match your chart's axes:
• Top-left: Highest RPM (x-axis max)
• Bottom-left: Lowest RPM (x-axis min)
• Top-right: Highest Torque (y-axis max)
• Bottom-right: Lowest Torque (y-axis min)

Enter the actual values in the input fields to calibrate the scale.`,
	},
	{
		number: 3,
		title: "Review & Refine",
		content: `The tool automatically detects the curve color. Review the extracted points:
• Red dots = detected curve points
• Click any point to remove it if it's an outlier
• Drag points to adjust for minor detection errors
• The curve updates in real-time as you make changes`,
	},
	{
		number: 4,
		title: "Add Missing Points",
		content: `If any points were missed during extraction:
• Click anywhere on the curve to add a new point
• Drag the new point to the correct position
• Points are automatically sorted by RPM

Use this to fill gaps where the curve color wasn't detected.`,
	},
	{
		number: 5,
		title: "Apply & Use",
		content: `Preview the extracted data table:
• Torque values are in Nm
• RPM values are in revolutions per minute
• Values are rounded to 1 decimal place for torque

Click "Apply" to save the curve to your vehicle setup.`,
	},
] as const;

type HelpContentProps = {
	view: "what" | "how";
	onClose: () => void;
	onShowGuide: () => void;
	onTryIt: () => void;
};

export const HelpContent: Component<HelpContentProps> = (props) => {
	const [currentStep, setCurrentStep] = createSignal(0);
	const maxStep = HELP_STEPS.length - 1;

	const handleNext = () => {
		if (currentStep() < maxStep) {
			setCurrentStep(currentStep() + 1);
		}
	};

	const handleBack = () => {
		if (currentStep() > 0) {
			setCurrentStep(currentStep() - 1);
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowRight") {
			handleNext();
		} else if (event.key === "ArrowLeft") {
			handleBack();
		}
	};

	onMount(() => {
		document.addEventListener("keydown", handleKeyDown);
	});

	onCleanup(() => {
		document.removeEventListener("keydown", handleKeyDown);
	});

	return (
		<div>
			<Show when={props.view === "what"}>
				<div>
					<span class="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-2 block">
						Overview
					</span>
					<h3 class="text-lg font-medium text-foreground mb-3">
						Import Torque Curves from Screenshots
					</h3>
					<div class="text-sm text-foreground-secondary leading-relaxed">
						<p class="mb-4">
							This tool extracts torque curve data from screenshots of dyno
							graphs or torque charts. It&apos;s designed to help you quickly
							transfer real-world or manufacturer torque curves into your CarX
							Street vehicle setup.
						</p>
						<p class="mb-4">
							The tool automatically detects the curve in your image, lets you
							calibrate the axes with the actual RPM and torque values, and
							outputs a ready-to-use data table.
						</p>
						<p>
							Perfect for recreating stock curves from dyno sheets, importing
							data from performance parts manufacturers, or fine-tuning based on
							reference charts.
						</p>
					</div>
				</div>
			</Show>
			<Show when={props.view === "how"}>
				<div>
					<span class="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-2 block">
						Step {HELP_STEPS[currentStep()].number} of {HELP_STEPS.length}
					</span>
					<h3 class="text-lg font-medium text-foreground mb-3">
						{HELP_STEPS[currentStep()].title}
					</h3>
					<div class="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line">
						{HELP_STEPS[currentStep()].content}
					</div>
				</div>
			</Show>
			<div class="mt-6 flex justify-between items-center">
				<Show when={props.view === "how"}>
					<button
						type="button"
						onClick={() => {
							setCurrentStep(0);
							props.onClose();
						}}
						class="border border-border hover:border-border bg-surface hover:bg-surface-elevated text-muted hover:text-foreground-secondary px-4 py-2 text-xs uppercase tracking-wider transition-colors"
					>
						← Close
					</button>
				</Show>
				<Show when={props.view === "what"}>
					<button
						type="button"
						onClick={props.onClose}
						class="border border-border hover:border-border bg-surface hover:bg-surface-elevated text-muted hover:text-foreground-secondary px-4 py-2 text-xs uppercase tracking-wider transition-colors"
					>
						Close
					</button>
				</Show>

				<Show when={props.view === "how"}>
					<span class="text-[10px] text-muted uppercase tracking-wider">
						{HELP_STEPS[currentStep()].number} / {HELP_STEPS.length}
					</span>
				</Show>

				<Show
					when={props.view === "how" && currentStep() < maxStep}
					fallback={
						<Show when={props.view === "how"}>
							<button
								type="button"
								onClick={props.onTryIt}
								class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors"
							>
								Try it →
							</button>
						</Show>
					}
				>
					<button
						type="button"
						onClick={handleNext}
						class="border border-emerald-600 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 px-4 py-2 text-xs uppercase tracking-wider transition-colors"
					>
						Next →
					</button>
				</Show>

				<Show when={props.view === "what"}>
					<button
						type="button"
						onClick={props.onShowGuide}
						class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors"
					>
						How to use this? →
					</button>
				</Show>
			</div>
		</div>
	);
};
