import { Show, For } from 'solid-js';
import { HelpTooltip } from './help-tooltip';
import { Formula } from './formula';

type HelpContent = {
  description: string;
  formula?: string;
  variables?: string[];
};

type MetricCardProps = {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
};

export function MetricCard(props: MetricCardProps) {
  return (
    <div
      class="flex flex-col items-center p-3 border"
      classList={{
        'border-amber-500/30 bg-amber-500/5': props.highlight,
        'border-border/50 bg-surface/30': !props.highlight,
      }}
    >
      <span class="text-[10px] uppercase tracking-wider text-muted mb-1">
        {props.label}
      </span>
      <div class="flex items-baseline gap-1">
        <span
          class="text-xl font-bold"
          classList={{
            'text-amber-400': props.highlight,
            'text-foreground': !props.highlight,
          }}
        >
          {props.value}
        </span>
        <Show when={props.unit}>
          <span class="text-xs text-muted">{props.unit}</span>
        </Show>
      </div>
    </div>
  );
}

type MetricCardWithHelpProps = {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  help: HelpContent;
};

export function MetricCardWithHelp(props: MetricCardWithHelpProps) {
  return (
    <div
      class="flex flex-col items-center p-3 border relative"
      classList={{
        'border-amber-500/30 bg-amber-500/5': props.highlight,
        'border-border/50 bg-surface/30': !props.highlight,
      }}
    >
      <div class="flex items-center gap-1 mb-1">
        <span class="text-[10px] uppercase tracking-wider text-muted">
          {props.label}
        </span>
        <HelpTooltip
          description={props.help.description}
          formula={props.help.formula}
          variables={props.help.variables}
          position="top"
        />
      </div>
      <div class="flex items-baseline gap-1">
        <span
          class="text-xl font-bold"
          classList={{
            'text-amber-400': props.highlight,
            'text-foreground': !props.highlight,
          }}
        >
          {props.value}
        </span>
        <Show when={props.unit}>
          <span class="text-xs text-muted">{props.unit}</span>
        </Show>
      </div>
    </div>
  );
}

type FormulaCardProps = {
  title: string;
  formula: string;
  variables: string[];
};

export function FormulaCard(props: FormulaCardProps) {
  return (
    <div class="border border-border/50 bg-surface/30 p-3">
      <div class="text-[10px] uppercase tracking-wider text-muted mb-2">
        {props.title}
      </div>
      <div class="bg-background/50 px-2 py-1.5 rounded mb-2 overflow-x-auto">
        <Formula math={props.formula} class="text-foreground" />
      </div>
      <div class="space-y-0.5">
        <For each={props.variables}>
          {(variable) => <div class="text-muted text-[10px] font-mono">{variable}</div>}
        </For>
      </div>
    </div>
  );
}
