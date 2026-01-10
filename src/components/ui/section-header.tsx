import type { Component } from 'solid-js';

interface SectionHeaderProps {
  title: string;
  variant?: 'input' | 'output';
  status?: 'nominal' | 'warning' | 'critical';
}

export const SectionHeader: Component<SectionHeaderProps> = (props) => {
  const isOutput = () => props.variant === 'output';
  const status = () => props.status ?? 'nominal';

  const statusBadge = () => {
    switch (status()) {
      case 'warning':
        return (
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            WRN
          </span>
        );
      case 'critical':
        return (
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
            ERR
          </span>
        );
      default:
        return (
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            NOM
          </span>
        );
    }
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
