import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Bookmark, Download, Heart, Share2, Sparkles } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { useStickerInteractions } from '../hooks/useStickerInteractions';
import {
  demoStickers,
  downloadStickerFile,
  getStickerById,
  getStickerFeed,
  resolveSharedSticker,
  shareUrl,
  toReadableDate,
  toReadableSize,
  type StickerResponse,
} from '../lib/backend';
import { toast } from 'sonner';

interface StickerDetailPageProps {
  tokenMode?: boolean;
}

export default function StickerDetailPage({ tokenMode = false }: StickerDetailPageProps) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const { likedIds, savedIds, toggleLike, toggleSave } = useStickerInteractions();
  const [sticker, setSticker] = useState<StickerResponse | null>(null);
  const [related, setRelated] = useState<StickerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeValue = tokenMode ? params.token : params.id;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!routeValue) {
        setLoading(false);
        setError('Sticker missing from route.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextSticker = tokenMode ? await resolveSharedSticker(routeValue) : await getStickerById(routeValue);
        if (cancelled) return;
        setSticker(nextSticker);

        const feed = await getStickerFeed(0, 48);
        if (cancelled) return;
        const base = feed.content.length > 0 ? feed.content : demoStickers;
        const nextRelated = base
          .filter((item) => item.id !== nextSticker.id)
          .filter(
            (item) =>
              item.category === nextSticker.category ||
              item.tags.some((tag) => nextSticker.tags.includes(tag))
          )
          .slice(0, 8);
        setRelated(nextRelated.length > 0 ? nextRelated : base.filter((item) => item.id !== nextSticker.id).slice(0, 8));
      } catch (fetchError) {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Could not load sticker');
        const demo = demoStickers.find((item) => item.id === routeValue) ?? demoStickers[0];
        setSticker(demo);
        setRelated(demoStickers.filter((item) => item.id !== demo.id).slice(0, 8));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [routeValue, tokenMode]);

  const shareLink = useMemo(() => {
    if (!sticker) return '';
    return shareUrl(sticker.shareToken);
  }, [sticker]);

  const handleShare = async () => {
    if (!sticker) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: sticker.name,
          text: sticker.description,
          url: shareLink,
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        toast.success('Share link copied');
      }
    } catch {
      toast.error('Share failed');
    }
  };

  const handleDownload = () => {
    if (!sticker) return;
    downloadStickerFile(sticker);
  };

  const handleLike = () => {
    if (!sticker) return;
    if (!authenticated) {
      openLoginPrompt('Login to like stickers and build your stash.', `${location.pathname}${location.search}`);
      return;
    }
    toggleLike(sticker.id);
  };

  const handleSave = () => {
    if (!sticker) return;
    if (!authenticated) {
      openLoginPrompt('Login to save stickers for later.', `${location.pathname}${location.search}`);
      return;
    }
    toggleSave(sticker.id);
  };

  const handleRelatedLike = (item: StickerResponse) => {
    if (!authenticated) {
      openLoginPrompt('Login to like stickers and build your stash.', `${location.pathname}${location.search}`);
      return;
    }
    toggleLike(item.id);
  };

  const handleRelatedSave = (item: StickerResponse) => {
    if (!authenticated) {
      openLoginPrompt('Login to save stickers for later.', `${location.pathname}${location.search}`);
      return;
    }
    toggleSave(item.id);
  };

  const handleRelatedShare = async (item: StickerResponse) => {
    try {
      await navigator.clipboard.writeText(shareUrl(item.shareToken));
      toast.success('Share link copied');
    } catch {
      toast.error('Share failed');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,61,87,0.22),_transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(77,163,255,0.2),_transparent_28%),linear-gradient(180deg,#050505_0%,#0e0e0e_100%)]" />

      <section className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
        >
          <ArrowLeft size={14} />
          Back to feed
        </Link>

        {loading ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
              <div className="h-[540px] animate-pulse rounded-[1.5rem] bg-white/10" />
              <div className="h-10 w-1/2 animate-pulse rounded-full bg-white/10" />
              <div className="h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : sticker ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/50">
                <img
                  src={sticker.cloudinaryUrl}
                  alt={sticker.name}
                  className="h-full max-h-[680px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                    {sticker.category}
                  </span>
                  <span className="rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">
                    {sticker.tags.join(' · ').slice(0, 30)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">{sticker.name}</h1>
                  <p className="mt-3 max-w-2xl text-white/70">{sticker.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`rounded-full border px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] ${
                      likedIds.includes(sticker.id)
                        ? 'border-[#ff4d4d] bg-[#ff4d4d]/20 text-white'
                        : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Heart size={14} />
                      Like
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className={`rounded-full border px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] ${
                      savedIds.includes(sticker.id)
                        ? 'border-[#ffdd33] bg-[#ffdd33]/20 text-white'
                        : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Bookmark size={14} />
                      Save
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Share2 size={14} />
                      Share
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="rounded-full border border-[#4da3ff]/40 bg-[#4da3ff]/20 px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white hover:bg-[#4da3ff]/30"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Download size={14} />
                      Download
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Owner</p>
                  <p className="mt-2 text-lg font-black">{sticker.owner.email}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Size</p>
                  <p className="mt-2 text-lg font-black">{toReadableSize(sticker.sizeBytes)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Format</p>
                  <p className="mt-2 text-lg font-black">{sticker.contentType}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Created</p>
                  <p className="mt-2 text-lg font-black">{toReadableDate(sticker.createdAt)}</p>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">
                  <Sparkles size={12} />
                  Related chaos
                </p>
                <div className="mt-4 grid gap-4">
                  {related.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/30 p-2">
                      <StickerCard
                        sticker={item}
                        liked={likedIds.includes(item.id)}
                        saved={savedIds.includes(item.id)}
                        onLike={() => handleRelatedLike(item)}
                        onSave={() => handleRelatedSave(item)}
                        onShare={() => handleRelatedShare(item)}
                        onDownload={() => downloadStickerFile(item)}
                        onOpen={() => navigate(`/sticker/${item.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-white/70">
            {error || 'Sticker not found.'}
          </div>
        )}
      </section>
    </main>
  );
}
