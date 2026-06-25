import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ShieldAlert, Github, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';

type Mode = 'login' | 'register';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { prompt } = useLoginPrompt();
  const { login, register, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const headline = useMemo(
    () => (mode === 'login' ? 'Get back in the chaos' : 'Create your chaos account'),
    [mode]
  );

  if (!prompt.open) {
    return null;
  }

  const runSuccess = async () => {
    onClose();
    navigate(prompt.returnTo || '/', { replace: true });
  };

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
      await runSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] text-white shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#ff3d57]/30 blur-3xl" />
        <div className="absolute -right-8 top-14 h-32 w-32 rounded-full bg-[#4da3ff]/30 blur-3xl" />

        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd33]">
              <ShieldAlert size={12} />
              {prompt.reason}
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-tight">{headline}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/65">
              Browse for free, but log in to save, like, and upload the sticker chaos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
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

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#4da3ff]/60"
                  placeholder="you@chaos.com"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#ff3d57]/60"
                  placeholder="At least 8 chars"
                  required
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-[#ff4d4d]/40 bg-[#ff4d4d]/15 px-4 py-3 text-sm text-[#ffb3b3]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-[#ff3d57] px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">
              OAuth is the fast lane
            </p>
            <button
              type="button"
              onClick={() => signInWithOAuth('github', prompt.returnTo)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#1f3f36] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#244a40]"
            >
              <Github size={16} />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={() => signInWithOAuth('google', prompt.returnTo)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#ff3d57] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:opacity-90"
            >
              <Chrome size={16} />
              Continue with Google
            </button>

            <div className="rounded-2xl border border-[#4da3ff]/20 bg-[#4da3ff]/10 p-4 text-sm text-white/75">
              <p className="font-black uppercase tracking-[0.18em] text-[#4da3ff]">Why you need this</p>
              <p className="mt-2">
                Guests can browse and download everything. You only need auth for likes, saves, uploads, and profile actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
