import { useQuery } from "@tanstack/solid-query";
import { createMemo } from "solid-js";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import type { OpenRouterModel } from "@/features/chat/types";
import { fetchOpenRouterModels } from "../openrouter";

type InferenceSelectorProps = {
	value: string;
	onChange: (modelId: string) => void;
	class?: string;
};

export function InferenceSelector(props: InferenceSelectorProps) {
	const modelsQuery = useQuery<OpenRouterModel[]>(() => ({
		queryKey: ["openrouter-models"],
		queryFn: fetchOpenRouterModels,
		staleTime: 5 * 60 * 1000,
	}));

	const options = createMemo<DropdownOption[]>(() => {
		if (!modelsQuery.data) return [];

		return modelsQuery.data
			.map((model) => ({
				value: model.id,
				label: model.name,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	});

	const displayLabel = createMemo(() => {
		const option = options().find(
			(o: DropdownOption) => o.value === props.value,
		);
		return option?.label ?? props.value;
	});

	return (
		<div class={`relative ${props.class ?? ""}`}>
			<Dropdown
				value={props.value}
				options={options()}
				onChange={props.onChange}
				placeholder={displayLabel() || "Select model..."}
				disabled={modelsQuery.isPending}
			/>
			{modelsQuery.isError && (
				<button
					type="button"
					onClick={() => modelsQuery.refetch()}
					class="absolute right-0 top-0 -translate-y-full mt-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
					title={modelsQuery.error?.message ?? "Failed to load models"}
				>
					Retry
				</button>
			)}
		</div>
	);
}
