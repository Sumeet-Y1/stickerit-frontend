import { Link, useLocation, useNavigate } from 'react-router';
import { Chrome, Download, Github, Search, Share2, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import WaveDivider from '../components/WaveDivider';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { useStickerInteractions } from '../hooks/useStickerInteractions';
import { authUrl, demoStickers, downloadStickerFile, shareUrl, type StickerResponse } from '../lib/backend';
import { toast } from 'sonner';

const colors = {
  pink: '#ef84d8',
  yellow: '#ffd044',
  mint: '#78e5bd',
  blue: '#8eb9ff',
  cream: '#fff7e8',
  black: '#111111',
};

const categories = ['Funny', 'Reactions', 'Trending', 'Fresh drops', 'Creator packs', 'Wholesome chaos'];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const { likedIds, savedIds, toggleLike, toggleSave } = useStickerInteractions();

  const promptLogin = (message: string, returnTo = `${location.pathname}${location.search}${location.hash}`) => {
    openLoginPrompt(message, returnTo);
  };

  const handleLike = (sticker: StickerResponse) => {
    if (!authenticated) {
      promptLogin('Login to like stickers and keep your favorites.');
      return;
    }
    toggleLike(sticker.id);
  };

  const handleSave = (sticker: StickerResponse) => {
    if (!authenticated) {
      promptLogin('Login to save stickers into your stash.');
      return;
    }
    toggleSave(sticker.id);
  };

  const handleShare = async (sticker: StickerResponse) => {
    try {
      await navigator.clipboard.writeText(shareUrl(sticker.shareToken));
      toast.success('Share link copied');
    } catch {
      toast.error('Could not share this sticker');
    }
  };

  return (
    <main className="overflow-hidden bg-[#fff7e8] text-black">
      <section className="relative bg-[#ef84d8] px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#ffd044] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[5px_5px_0_#111]">
              <Sparkles size={16} />
              StickerIT
            </p>
            <h1 className="mt-7 max-w-3xl text-6xl font-black uppercase leading-[0.88] text-white sm:text-7xl lg:text-8xl">
              Meme stickers that slap.
            </h1>
            <p className="mt-6 max-w-xl text-xl font-black leading-snug text-black">
              Browse, download, and share funny meme stickers. Login only when you want to like, save, or upload.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {authenticated ? (
                <>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#78e5bd] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
                  >
                    <Search size={18} />
                    Explore
                  </Link>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#ef84d8] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
                  >
                    <UploadCloud size={18} />
                    Upload
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
                  >
                    <UserRound size={18} />
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <a
                    href={authUrl('github')}
                    className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[5px_5px_0_#fff] transition-transform hover:-translate-y-1"
                  >
                    <Github size={18} />
                    GitHub login
                  </a>
                  <a
                    href={authUrl('google')}
                    className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
                  >
                    <Chrome size={18} />
                    Google login
                  </a>
                </>
              )}
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#78e5bd] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
              >
                <Search size={18} />
                Explore
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <div className="absolute left-[6%] top-[4%] w-[44%] rotate-[-8deg] rounded-[2rem] border-[4px] border-black bg-white p-3 shadow-[10px_10px_0_#111]">
              <img src={demoStickers[0].cloudinaryUrl} alt="" className="aspect-square rounded-[1.4rem] object-cover" />
            </div>
            <div className="absolute right-[5%] top-[10%] w-[42%] rotate-[7deg] rounded-[2rem] border-[4px] border-black bg-[#ffd044] p-3 shadow-[10px_10px_0_#111]">
              <img src={demoStickers[3].cloudinaryUrl} alt="" className="aspect-square rounded-[1.4rem] object-cover" />
            </div>
            <div className="absolute bottom-[10%] left-[18%] w-[48%] rotate-[4deg] rounded-[2rem] border-[4px] border-black bg-[#78e5bd] p-3 shadow-[10px_10px_0_#111]">
              <img src={demoStickers[5].cloudinaryUrl} alt="" className="aspect-square rounded-[1.4rem] object-cover" />
            </div>
            <div className="absolute bottom-[4%] right-[6%] rounded-full border-[4px] border-black bg-white px-5 py-4 text-2xl font-black shadow-[7px_7px_0_#111]">
              24/7 fresh
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fromColor={colors.pink} toColor={colors.yellow} />

      <section className="bg-[#ffd044] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl">Trending stickers</h2>
              <p className="mt-3 max-w-2xl text-lg font-bold text-black/70">
                Fast picks from the feed, ready to download or throw into the chat.
              </p>
            </div>
            <Link
              to="/explore"
              className="rounded-full border-[3px] border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {demoStickers.slice(0, 4).map((sticker, index) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                liked={likedIds.includes(sticker.id)}
                saved={savedIds.includes(sticker.id)}
                onLike={() => handleLike(sticker)}
                onSave={() => handleSave(sticker)}
                onShare={() => handleShare(sticker)}
                onDownload={() => downloadStickerFile(sticker)}
                onOpen={() => navigate(`/sticker/${sticker.id}`)}
                accentIndex={index}
              />
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fromColor={colors.yellow} toColor={colors.mint} flip />

      <section className="bg-[#78e5bd] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl">Pick a lane. Make it weird.</h2>
            <p className="mt-4 text-lg font-bold text-black/70">
              Search by mood, reaction, creator, or whatever phrase your brain typed first.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((item, index) => (
              <Link
                key={item}
                to={`/explore?category=${encodeURIComponent(item)}`}
                className="rounded-[2rem] border-[3px] border-black bg-white p-6 text-2xl font-black uppercase shadow-[7px_7px_0_#111] transition-transform hover:-translate-y-1"
                style={{ background: index % 2 ? '#fff7e8' : '#8eb9ff' }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fromColor={colors.mint} toColor={colors.blue} />

      <section className="bg-[#8eb9ff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-center text-4xl font-black uppercase leading-none sm:text-6xl">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: 'Browse', text: 'Search, filter, and scroll the sticker wall.', icon: Search, color: '#ef84d8' },
              { title: 'Download', text: 'Grab the file without needing an account.', icon: Download, color: '#ffd044' },
              { title: 'Share', text: 'Copy the link and send the chaos anywhere.', icon: Share2, color: '#78e5bd' },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-[2rem] border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#111]">
                  <div
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-[3px] border-black"
                    style={{ background: step.color }}
                  >
                    <Icon size={34} strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black uppercase">{step.title}</h3>
                  <p className="mt-3 text-base font-bold text-black/65">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider fromColor={colors.blue} toColor={colors.black} flip />

      <footer className="bg-[#111111] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-black uppercase">StickerIT</p>
            <p className="mt-1 text-sm font-bold text-white/60">Funny and shareable meme stickers.</p>
          </div>
          <button
            type="button"
            onClick={() => authenticated ? navigate('/upload') : promptLogin('Login to upload your sticker.', '/upload')}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-white bg-[#ef84d8] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_#fff] transition-transform hover:-translate-y-1"
          >
            <UploadCloud size={18} />
            Upload sticker
          </button>
        </div>
      </footer>
    </main>
  );
}
