import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, type Location } from 'react-router';
import { ArrowLeft, Bookmark, Download, Heart, Share2, Sparkles, X } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { useStickerInteractions } from '../hooks/useStickerInteractions';
import {
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
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

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

        const feed = await getStickerFeed(0, 64);
        if (cancelled) return;

        const candidates = feed.content
          .filter((item) => item.id !== nextSticker.id)
          .filter(
            (item) =>
              item.category === nextSticker.category ||
              item.tags.some((tag) => nextSticker.tags.includes(tag))
          )
          .slice(0, 8);

        setRelated(candidates);
      } catch (fetchError) {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Could not load sticker');
        setSticker(null);
        setRelated([]);
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

  const closeModal = () => {
    if (backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate('/explore', { replace: true });
  };

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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3 backdrop-blur-xl sm:p-4 lg:p-6">
      <div className="relative h-[calc(100vh-1.5rem)] w-full max-w-[1600px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] text-white shadow-[0_30px_120px_rgba(0,0,0,0.7)] sm:h-[calc(100vh-2rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,61,87,0.18),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(77,163,255,0.16),_transparent_26%),linear-gradient(180deg,#0b0b0b_0%,#111111_100%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-white/80 transition hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft size={14} />
                  Back
                </span>
              </button>
              <p className="hidden rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd33] sm:inline-flex">
                Popup detail view
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-white/80 transition hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <X size={14} />
                Close
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {loading ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
                  <div className="h-[56vh] animate-pulse rounded-[1.5rem] bg-white/10" />
                  <div className="h-10 w-1/2 animate-pulse rounded-full bg-white/10" />
                  <div className="h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="grid gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ) : sticker ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="group block w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/50 text-left"
                    aria-label={`Download ${sticker.name}`}
                  >
                    <div className="relative">
                      <img
                        src={sticker.cloudinaryUrl}
                        alt={sticker.name}
                        className="max-h-[68vh] w-full object-contain bg-black/40"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                          {sticker.category}
                        </span>
                        <span className="rounded-full border border-[#ffdd33]/30 bg-[#ffdd33]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">
                          {sticker.tags.join(' · ').slice(0, 30)}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                        Tap to download
                      </div>
                    </div>
                  </button>

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
                      {related.length > 0 ? (
                        related.map((item) => (
                          <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/30 p-2">
                            <StickerCard
                              sticker={item}
                              liked={likedIds.includes(item.id)}
                              saved={savedIds.includes(item.id)}
                              onLike={() => handleRelatedLike(item)}
                              onSave={() => handleRelatedSave(item)}
                              onShare={() => handleRelatedShare(item)}
                              onDownload={() => downloadStickerFile(item)}
                              onOpen={() =>
                                navigate(`/sticker/${item.id}`, {
                                  state: { backgroundLocation },
                                })
                              }
                            />
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/30 p-6 text-sm text-white/60">
                          No related stickers found yet. Upload more with similar tags and they will show here.
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-white/70">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ffdd33]">Sticker missing</p>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-tight">Could not load sticker</h2>
                  <p className="mt-3 max-w-xl text-white/60">{error || 'Try opening another sticker from the feed.'}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-white/80 hover:bg-white/10"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/explore', { replace: true })}
                      className="rounded-full bg-[#ff3d57] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-white hover:opacity-90"
                    >
                      Go to explore
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
