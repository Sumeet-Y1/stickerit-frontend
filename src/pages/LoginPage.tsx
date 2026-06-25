import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Chrome, Github, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const { login, register, signInWithOAuth, authenticated } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === 'login' ? 'Welcome back, menace.' : 'Create a chaos account.'),
    [mode]
  );

  useEffect(() => {
    if (authenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [authenticated, navigate, returnTo]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
      toast.success(mode === 'login' ? 'Logged in' : 'Account created');
      navigate(returnTo, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,61,87,0.18),_transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(77,163,255,0.18),_transparent_24%),linear-gradient(180deg,#050505_0%,#111111_100%)]" />
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd33]">
              <ShieldAlert size={12} />
              Login portal
            </p>
            <h1 className="mt-6 max-w-2xl text-5xl font-black uppercase tracking-tight sm:text-7xl">{title}</h1>
            <p className="mt-4 max-w-xl text-white/65">
              You can browse StickerIT without signing in. Log in only when you want to save, like, upload, and keep your stash synced.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => signInWithOAuth('github', returnTo)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1f3f36] px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:bg-[#244a40]"
              >
                <Github size={14} />
                GitHub OAuth
              </button>
              <button
                type="button"
                onClick={() => signInWithOAuth('google', returnTo)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#ff3d57] px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:opacity-90"
              >
                <Chrome size={14} />
                Google OAuth
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] ${
                  mode === 'login' ? 'bg-white text-black' : 'bg-white/5 text-white/60'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] ${
                  mode === 'register' ? 'bg-white text-black' : 'bg-white/5 text-white/60'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#4da3ff]/60"
                  placeholder="you@chaos.com"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff3d57]/60"
                  placeholder="8+ chars, mixed case, number"
                  required
                />
              </label>

              {error && <div className="rounded-2xl border border-[#ff4d4d]/40 bg-[#ff4d4d]/15 px-4 py-3 text-sm text-[#ffb3b3]">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-[#ff3d57] px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn size={14} />
                  {busy ? 'Working...' : mode === 'login' ? 'Login now' : 'Create account'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
