import { createFileRoute } from "@tanstack/solid-router";
import remarkGfm from "remark-gfm";
import { SolidMarkdown } from "solid-markdown";
import aboutContent from "@/content/about.md?raw";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<div class="space-y-4">
			<div class="border border-border/50 bg-background/50">
				<div class="p-4">
					<div class="prose prose-sm dark:prose-invert max-w-[80ch] mx-auto">
						<SolidMarkdown remarkPlugins={[remarkGfm]}>
							{aboutContent}
						</SolidMarkdown>
					</div>
				</div>
			</div>
		</div>
	);
}
