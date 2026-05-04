import { render } from 'solid-js/web';
import { createSignal, onMount, Show } from 'solid-js';
import { supabase } from './supabase';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router'; // atau router lu yang sekarang

function AppWrapper() {
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
      <div style={{ background: '#000', color: '#0f0', height: '100vh', display: 'flex', "flex-direction": 'column', "justify-content": 'center', "align-items": 'center', "font-family": 'monospace' }}>
        <h1 style={{ "letter-spacing": '5px' }}>GEARX_LOCKED</h1>
        <div style={{ display: 'flex', "flex-direction": 'column', gap: '10px', width: '280px', border: '1px solid #0f0', padding: '20px' }}>
          <input type="email" placeholder="USER_EMAIL" onInput={e => setEmail(e.currentTarget.value)} style={{ background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '10px' }} />
          <input type="password" placeholder="ACCESS_KEY" onInput={e => setPassword(e.currentTarget.value)} style={{ background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '10px' }} />
          <button onClick={handleLogin} style={{ background: '#0f0', color: '#000', padding: '10px', "font-weight": 'bold', cursor: 'pointer' }}>INITIATE_BOOT</button>
        </div>
      </div>
    }>
      {/* Ini bakal manggil router asli dashboard lu */}
      <Router>
        <FileRoutes />
      </Router>
    </Show>
  );
}

const root = document.getElementById('root');
if (root) render(() => <AppWrapper />, root);
