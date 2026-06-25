import { Link } from 'react-router';
import { Bookmark, Download, Heart, Share2 } from 'lucide-react';
import type { StickerResponse } from '../lib/backend';

interface StickerCardProps {
  sticker: StickerResponse;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
  onOpen: () => void;
  accentIndex?: number;
}

const rotationSteps = [-4, -2, 0, 2, 4, 6];
const accentSteps = ['#ffd24a', '#ff7aa2', '#62e6c5', '#7aa7ff', '#ff9b57', '#fff2c9'];

function pickRotation(value: string) {
  const index = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return rotationSteps[index % rotationSteps.length];
}

export default function StickerCard({
  sticker,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onDownload,
  onOpen,
  accentIndex = 0,
}: StickerCardProps) {
  const rotation = pickRotation(sticker.id);
  const accent = accentSteps[accentIndex % accentSteps.length];

  return (
    <article
      className="group relative overflow-hidden rounded-[2rem] border-[3px] border-black bg-white shadow-[8px_8px_0_#000] transition-transform duration-300 hover:-translate-y-1"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Open ${sticker.name}`}>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-2" style={{ background: accent }} />
          <img
            src={sticker.cloudinaryUrl}
            alt={sticker.name}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover"
          />
          <div className="absolute left-3 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-black shadow-[3px_3px_0_#000]">
              {sticker.category}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-black">{sticker.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-black/70">{sticker.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sticker.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border-2 border-black bg-[#fff3d0] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 border-t-2 border-black bg-[#fff8ef] p-3">
        <Link
          to={`/sticker/${sticker.id}`}
          className="flex-1 rounded-full border-2 border-black bg-[#ffcf5a] px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.24em] text-black transition-transform hover:-translate-y-0.5"
        >
          View
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onLike();
          }}
          className={`rounded-full border-2 border-black px-3 py-2 text-black transition-transform hover:-translate-y-0.5 ${
            liked ? 'bg-[#ff7aa2]' : 'bg-white'
          }`}
          aria-label={`Like ${sticker.name}`}
        >
          <Heart size={16} className={liked ? 'fill-current' : ''} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
          className={`rounded-full border-2 border-black px-3 py-2 text-black transition-transform hover:-translate-y-0.5 ${
            saved ? 'bg-[#ffd24a]' : 'bg-white'
          }`}
          aria-label={`Save ${sticker.name}`}
        >
          <Bookmark size={16} className={saved ? 'fill-current' : ''} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShare();
          }}
          className="rounded-full border-2 border-black bg-[#62e6c5] px-3 py-2 text-black transition-transform hover:-translate-y-0.5"
          aria-label={`Share ${sticker.name}`}
        >
          <Share2 size={16} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownload();
          }}
          className="rounded-full border-2 border-black bg-[#7aa7ff] px-3 py-2 text-black transition-transform hover:-translate-y-0.5"
          aria-label={`Download ${sticker.name}`}
        >
          <Download size={16} />
        </button>
      </div>
    </article>
  );
}
