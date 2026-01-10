import type { Component } from 'solid-js';

interface SectionHeaderProps {
  title: string;
  variant?: 'input' | 'output';
}

export const SectionHeader: Component<SectionHeaderProps> = (props) => {
  const isOutput = () => props.variant === 'output';

  const statusBadge = () => {
    return isOutput() ? (
      <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
        OUTPUT
      </span>
    ) : (
      <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
        INPUT
      </span>
    );
  };

  return (
    <div
      class="flex items-center justify-between px-3 py-2 border-b"
      classList={{
        'bg-slate-900/80 border-slate-700/50': true,
      }}
    >
      <div class="flex items-center gap-3">
        <div
          class="w-1.5 h-4"
          classList={{
            'bg-cyan-500': !isOutput(),
            'bg-amber-500': isOutput(),
          }}
        />
        <span
          class="font-semibold tracking-wider text-xs uppercase"
          classList={{
            'text-slate-300': true,
          }}
        >
          {props.title}
        </span>
      </div>
      {statusBadge()}
    </div>
  );
};
