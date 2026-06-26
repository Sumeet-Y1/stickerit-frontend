import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import SkeletonCard from '../components/SkeletonCard';
import WaveDivider from '../components/WaveDivider';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { useStickerInteractions } from '../hooks/useStickerInteractions';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { downloadStickerFile, getStickerFeed, mergeRecentUploads, readRecentUploads, searchStickers, shareUrl, type StickerResponse } from '../lib/backend';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = ['All', 'Meme', 'Chaos', 'Reaction', 'Cute', 'Weird'];
const PAGE_SIZE = 24;

function matchesCategory(sticker: StickerResponse, category: string) {
  if (category === 'All') return true;
  return sticker.category.toLowerCase() === category.toLowerCase();
}

function matchesSearch(sticker: StickerResponse, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [sticker.name, sticker.description, sticker.category, sticker.tags.join(' '), sticker.owner.email]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { authenticated } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const { likedIds, savedIds, toggleLike, toggleSave } = useStickerInteractions();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [stickers, setStickers] = useState<StickerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setPage(0);

      try {
        if (trimmed) {
          const results = await searchStickers(trimmed);
          if (cancelled || !mountedRef.current) return;
          setStickers(mergeRecentUploads(results));
          setHasMore(false);
        } else {
          const response = await getStickerFeed(0, PAGE_SIZE);
          if (cancelled || !mountedRef.current) return;
          setStickers(mergeRecentUploads(response.content));
          setHasMore(Boolean(response.last === false && response.content.length >= PAGE_SIZE));
        }
      } catch (requestError) {
        if (cancelled || !mountedRef.current) return;
        setStickers(readRecentUploads());
        setHasMore(false);
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (query.trim() || page === 0) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoadingMore(true);
      try {
        const response = await getStickerFeed(page, PAGE_SIZE);
        if (cancelled || !mountedRef.current) return;
        setStickers((current) => mergeRecentUploads([...current, ...response.content]));
        setHasMore(Boolean(response.last === false && response.content.length >= PAGE_SIZE));
      } catch {
        if (!cancelled && mountedRef.current) setHasMore(false);
      } finally {
        if (!cancelled && mountedRef.current) setLoadingMore(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [page, query]);

  const filtered = useMemo(
    () => stickers.filter((sticker) => matchesCategory(sticker, category) && matchesSearch(sticker, query)),
    [stickers, category, query]
  );

  const uniqueCategories = useMemo(() => {
    const backendCategories = Array.from(new Set(stickers.map((sticker) => sticker.category).filter(Boolean)));
    return ['All', ...Array.from(new Set([...DEFAULT_CATEGORIES.slice(1), ...backendCategories]))];
  }, [stickers]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore || query.trim()) return;
    setPage((current) => current + 1);
  };

  const sentinelRef = useInfiniteScroll(loadMore, { rootMargin: '1200px' });

  const requireLogin = (message: string) => {
    openLoginPrompt(message, `${location.pathname}${location.search}${location.hash}`);
  };

  const handleLike = (sticker: StickerResponse) => {
    if (!authenticated) {
      requireLogin('Login to like stickers and keep your favorites.');
      return;
    }
    toggleLike(sticker.id);
  };

  const handleSave = (sticker: StickerResponse) => {
    if (!authenticated) {
      requireLogin('Login to save stickers into your stash.');
      return;
    }
    toggleSave(sticker.id);
  };

  const handleShare = async (sticker: StickerResponse) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: sticker.name, text: sticker.description, url: shareUrl(sticker.shareToken) });
      } else {
        await navigator.clipboard.writeText(shareUrl(sticker.shareToken));
        toast.success('Share link copied');
      }
    } catch {
      toast.error('Could not share this sticker');
    }
  };

  return (
    <main className="overflow-hidden bg-[#fff7e8] text-black">
      <section className="bg-[#ffd044] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[5px_5px_0_#111]">
                <SlidersHorizontal size={16} />
                Explore
              </p>
              <h1 className="mt-6 text-5xl font-black uppercase leading-none sm:text-7xl">Sticker wall</h1>
              <p className="mt-3 max-w-2xl text-lg font-bold text-black/70">Search the public feed, download freely, and save after login.</p>
            </div>
            <button
              type="button"
              onClick={() => authenticated ? navigate('/upload') : requireLogin('Login to upload your sticker.')}
              className="rounded-full border-[3px] border-black bg-[#ef84d8] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
            >
              Upload
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-[2rem] border-[3px] border-black bg-white p-3 shadow-[8px_8px_0_#111] sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-full border-[3px] border-black bg-[#fff7e8] px-4 py-3">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search funny, reaction, creator, or weird..."
                className="w-full bg-transparent text-sm font-bold text-black outline-none placeholder:text-black/45"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] ${
                    category === item ? 'bg-black text-white' : 'bg-[#78e5bd] text-black'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fromColor="#ffd044" toColor="#fff7e8" />

      <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((sticker, index) => (
                  <div key={sticker.id} className="h-full">
                    <StickerCard
                      sticker={sticker}
                      liked={likedIds.includes(sticker.id)}
                      saved={savedIds.includes(sticker.id)}
                      onLike={() => handleLike(sticker)}
                      onSave={() => handleSave(sticker)}
                      onShare={() => handleShare(sticker)}
                      onDownload={() => downloadStickerFile(sticker)}
                      onOpen={() =>
                        navigate(`/sticker/${sticker.id}`, {
                          state: { backgroundLocation: location, sticker },
                        })
                      }
                      accentIndex={index}
                    />
                  </div>
                ))}
              </div>
              {hasMore && !query.trim() && (
                <div ref={sentinelRef} className="mt-10 flex items-center justify-center py-8 text-sm font-black uppercase tracking-[0.08em]">
                  {loadingMore ? 'Loading more stickers...' : 'Scroll for more'}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[2rem] border-[3px] border-black bg-white p-10 text-center shadow-[8px_8px_0_#111]">
              <h3 className="text-4xl font-black uppercase">No stickers found</h3>
              <p className="mt-3 text-base font-bold text-black/65">
                The public feed is empty right now. Upload a sticker or try again once the API responds.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
