import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BookHeart, LogOut, Sparkles, UploadCloud } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { useStickerInteractions } from '../hooks/useStickerInteractions';
import { demoStickers, downloadStickerFile, getStickerFeed, shareUrl, type StickerResponse } from '../lib/backend';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, authenticated, logout } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const { likedIds, savedIds, toggleLike, toggleSave } = useStickerInteractions();
  const [uploads, setUploads] = useState<StickerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const response = await getStickerFeed(0, 100);
        if (cancelled) return;
        setUploads(response.content);
      } catch {
        if (cancelled) return;
        setUploads(demoStickers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const username = session?.user.email?.split('@')[0] || 'guest';
  const myUploads = useMemo(() => {
    if (!session?.user.email) return [];
    return uploads.filter((item) => item.owner.email.toLowerCase() === session.user.email.toLowerCase());
  }, [session?.user.email, uploads]);
  const mySaved = useMemo(() => uploads.filter((item) => savedIds.includes(item.id)), [savedIds, uploads]);
  const myLiked = useMemo(() => uploads.filter((item) => likedIds.includes(item.id)), [likedIds, uploads]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  if (!authenticated) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,61,87,0.16),_transparent_28%),linear-gradient(180deg,#050505_0%,#0e0e0e_100%)]" />
        <section className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd33]">
            <BookHeart size={12} />
            Profile locked
          </p>
          <h1 className="mt-6 text-5xl font-black uppercase tracking-tight sm:text-7xl">Log in to see your sticker stash.</h1>
          <p className="mt-4 max-w-2xl text-white/65">
            Your uploads, saved stickers, and likes live here. Guests can browse and download, but profile actions need a session.
          </p>
          <button
            type="button"
            onClick={() => openLoginPrompt('Login to unlock your profile.', `${location.pathname}${location.search}${location.hash}`)}
            className="mt-8 rounded-full bg-[#ff3d57] px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-white hover:opacity-90"
          >
            Log in now
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(77,163,255,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,61,87,0.18),_transparent_28%),linear-gradient(180deg,#050505_0%,#101010_100%)]" />

      <section className="relative mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/75">
              <Sparkles size={12} />
              Profile zone
            </p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-6xl">{username}&apos;s chaos stash</h1>
            <p className="mt-3 text-white/65">You own the uploads, the likes, and the saved madness.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.24em] hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut size={14} />
              Logout
            </span>
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Uploads', count: myUploads.length, color: '#ff3d57' },
            { label: 'Saved', count: mySaved.length, color: '#ffdd33' },
            { label: 'Liked', count: myLiked.length, color: '#4da3ff' },
          ].map((item) => (
            <div key={item.label} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/50">{item.label}</p>
              <p className="mt-2 text-4xl font-black" style={{ color: item.color }}>
                {item.count}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black uppercase tracking-tight">Your uploads</h2>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="rounded-full bg-[#ff3d57] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white hover:opacity-90"
              >
                <span className="inline-flex items-center gap-2">
                  <UploadCloud size={14} />
                  Upload more
                </span>
              </button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : myUploads.length > 0 ? (
              <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
                {myUploads.map((item) => (
                  <div key={item.id} className="mb-4 break-inside-avoid">
                    <StickerCard
                      sticker={item}
                      liked={likedIds.includes(item.id)}
                      saved={savedIds.includes(item.id)}
                      onLike={() => toggleLike(item.id)}
                      onSave={() => toggleSave(item.id)}
                      onShare={() => navigator.clipboard.writeText(shareUrl(item.shareToken))}
                      onDownload={() => downloadStickerFile(item)}
                      onOpen={() => navigate(`/sticker/${item.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/65">
                You haven&apos;t uploaded anything yet. Hit Upload and unleash a sticker.
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-black uppercase tracking-tight">Saved stickers</h2>
            {mySaved.length > 0 ? (
              <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
                {mySaved.map((item) => (
                  <div key={item.id} className="mb-4 break-inside-avoid">
                    <StickerCard
                      sticker={item}
                      liked={likedIds.includes(item.id)}
                      saved={savedIds.includes(item.id)}
                      onLike={() => toggleLike(item.id)}
                      onSave={() => toggleSave(item.id)}
                      onShare={() => navigator.clipboard.writeText(shareUrl(item.shareToken))}
                      onDownload={() => downloadStickerFile(item)}
                      onOpen={() => navigate(`/sticker/${item.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/65">
                Your saved stickers will show up here.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
