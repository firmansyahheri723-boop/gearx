export function DashboardHeader() {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <header class="border border-neutral-800/50 bg-neutral-900/50 mb-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 sm:py-3 gap-2 sm:gap-4">
        {/* Logo / Title */}
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="text-neutral-400 font-bold text-base sm:text-lg tracking-widest uppercase">
            GearX
          </div>
          <div class="hidden sm:block h-4 w-px bg-neutral-700" />
          <div class="hidden sm:flex items-center gap-3 sm:gap-4 text-xs">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-neutral-400 uppercase tracking-wider">System</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-neutral-400 uppercase tracking-wider">Calc</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500" />
              <span class="text-neutral-400 uppercase tracking-wider">Sync</span>
            </span>
          </div>
        </div>

        {/* Right side - Status */}
        <div class="flex items-center gap-2 sm:gap-4">
          <div class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
            READY
          </div>
          <div class="hidden sm:block text-neutral-500 text-xs font-mono">{timestamp}</div>
        </div>
      </div>
    </header>
  );
}
