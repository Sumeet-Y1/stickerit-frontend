import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CloudUpload, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { displayNameFromEmail, rememberRecentUpload, uploadSticker } from '../lib/backend';
import { toast } from 'sonner';

const CATEGORIES = ['Meme', 'Chaos', 'Reaction', 'Cute', 'Weird'];

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, session } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meme');
  const [tags, setTags] = useState('chaos, meme, sticker');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authenticated) {
      openLoginPrompt('Login first, then upload your sticker chaos.', `${location.pathname}${location.search}${location.hash}`);
      return;
    }

    if (!file) {
      setError('Pick a file first.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const next = await uploadSticker({
        name,
        description,
        category,
        tags,
        file,
      });

      rememberRecentUpload(next);
      toast.success('Sticker uploaded');
      navigate(`/sticker/${next.id}`, {
        state: { backgroundLocation: location },
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,61,87,0.18),_transparent_28%),radial-gradient(circle_at_20%_20%,_rgba(77,163,255,0.18),_transparent_24%),linear-gradient(180deg,#050505_0%,#0d0d0d_100%)]" />
      <section className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd33]">
              <CloudUpload size={12} />
              Upload zone
            </p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-6xl">Drop a sticker into the chaos.</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              Build a sticker that people will download, share, and throw into the group chat immediately.
            </p>
          </div>

          {!authenticated && (
            <button
              type="button"
              onClick={() => openLoginPrompt('Login to unlock uploads.', `${location.pathname}${location.search}${location.hash}`)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.24em] hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Lock size={14} />
                Login first
              </span>
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Sticker name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff3d57]/60"
                  placeholder="Cursed office goblin"
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#4da3ff]/60"
                  placeholder="A sticker for when the whole chat is cooked."
                  maxLength={1000}
                />
              </label>
              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ffdd33]/60"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Tags</span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#36d399]/60"
                  placeholder="chaos, meme, funny"
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Sticker file</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-dashed border-white/20 bg-black/40 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#ff3d57] file:px-4 file:py-2 file:text-[11px] file:font-black file:uppercase file:tracking-[0.22em] file:text-white hover:border-white/30"
                  required
                />
              </label>
            </div>

            {error && <div className="mt-4 rounded-2xl border border-[#ff4d4d]/40 bg-[#ff4d4d]/15 px-4 py-3 text-sm text-[#ffb3b3]">{error}</div>}

            <button
              type="submit"
              disabled={busy || !authenticated}
              className="mt-5 w-full rounded-2xl bg-[#ff3d57] px-5 py-4 text-sm font-black uppercase tracking-[0.26em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Uploading...' : 'Launch sticker'}
            </button>

            {authenticated && session && (
              <p className="mt-3 text-center text-xs uppercase tracking-[0.22em] text-white/45">
                Logged in as {displayNameFromEmail(session.user.email)}
              </p>
            )}
          </form>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">
                <Sparkles size={12} />
                Upload rules
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>- Pick a sticker or meme image that reads instantly.</li>
                <li>- Keep the filename clean. The backend validates it.</li>
                <li>- Tags help the feed and search actually work.</li>
                <li>- Once uploaded, you&apos;ll land in a popup detail view.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Preview</p>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Sticker preview"
                  className="mt-4 max-h-[420px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="mt-4 flex h-[420px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-black/30 text-white/35">
                  No file selected yet
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
