import { createRootRoute, Outlet } from '@tanstack/solid-router';
import { createSignal, onMount, Show } from 'solid-js';
import { supabase } from '../supabase';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [session, setSession] = createSignal(null);
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  });

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: email(), password: password() });
    if (error) alert(error.message);
  };

  return (
    <Show when={session()} fallback={
      <div style={{ background: '#000', color: '#0f0', height: '100vh', display: 'flex', "flex-direction": 'column', "justify-content": 'center', "align-items": 'center', "font-family": 'monospace', "text-align": 'center' }}>
        <h1 style={{ "letter-spacing": '5px', "border-bottom": '2px solid #0f0', "padding-bottom": '10px' }}>GEARX_SYSTEM_LOCKED</h1>
        <div style={{ display: 'flex', "flex-direction": 'column', gap: '15px', width: '280px', marginTop: '20px' }}>
          <input type="email" placeholder="ADMIN_EMAIL" onInput={e => setEmail(e.currentTarget.value)} style={{ background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '12px', outline: 'none' }} />
          <input type="password" placeholder="ACCESS_KEY" onInput={e => setPassword(e.currentTarget.value)} style={{ background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '12px', outline: 'none' }} />
          <button onClick={handleLogin} style={{ background: '#0f0', color: '#000', padding: '12px', "font-weight": 'bold', cursor: 'pointer', border: 'none' }}>AUTHENTICATE</button>
        </div>
        <p style={{ "font-size": '10px', marginTop: '30px', opacity: '0.5' }}>SECURE_ENCRYPTION_ACTIVE</p>
      </div>
    }>
      {/* Kalau sudah login, baru tampilin isi dashboard (Outlet) */}
      <Outlet />
    </Show>
  );
}
initDatabase();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				clearSelection();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		const params = new URLSearchParams(window.location.search);
		const encoded = params.get("setup");
		if (encoded) {
			const data = deserializeSetup(encoded);
			if (data) {
				applySharedSetup(data);
				setShowLoadedBanner(true);
				window.history.replaceState(null, "", window.location.pathname);
			}
		}

		onCleanup(() => {
			cleanupThemeListener();
			document.removeEventListener("keydown", handleKeyDown);
		});
	});

	return (
		<div class="min-h-screen p-2 sm:p-4 lg:p-6 font-mono flex justify-center">
			<div class="w-full max-w-full lg:max-w-7xl">
				<DashboardHeader />

				<Show when={showLoadedBanner()}>
					<div class="mb-4 px-3 py-2 bg-foreground/10 border border-foreground/20 text-foreground-secondary text-xs uppercase tracking-wider flex items-center justify-between">
						<span>Setup loaded from URL</span>
						<button
							type="button"
							onClick={() => setShowLoadedBanner(false)}
							class="hover:text-foreground cursor-pointer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						</button>
					</div>
				</Show>

				<div class="border border-border/50 bg-background/50 mb-4">
					<div class="flex overflow-x-auto scrollbar-hide">
						<For each={TABS}>
							{(tab) => (
								<Link
									to={tab.to}
									class={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider transition-colors focus:outline-none shrink-0 whitespace-nowrap border-b-2 cursor-pointer ${
										location().pathname === tab.to ||
										(
											tab.to === "/" &&
												(location().pathname === "/" ||
													location().pathname === "")
										)
											? "bg-surface/80 text-foreground border-border"
											: "bg-transparent text-muted hover:text-foreground-secondary hover:bg-surface/30 border-transparent"
									}`}
								>
									<span class="font-semibold">{tab.label}</span>
								</Link>
							)}
						</For>
						<div class="flex-1 border-b border-border/30 shrink-0" />
					</div>
				</div>

				<Outlet />
			</div>
		</div>
	);
}
