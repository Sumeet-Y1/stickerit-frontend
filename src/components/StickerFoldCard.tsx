import { useState } from 'react';

interface StickerFoldCardProps {
  image: string;
  title: string;
  description: string;
  meta: string;
}

export default function StickerFoldCard({
  image,
  title,
  description,
  meta,
}: StickerFoldCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  return (
    <div
      className={`sticker-fold ${isOpen && isTouchDevice ? 'is-open' : ''}`}
      style={{
        ['--sticker-fold-img' as string]: `url(${image})`,
      }}
      onClick={() => isTouchDevice && setIsOpen(!isOpen)}
    >
      {/* Image Layer */}
      <div
        className="sticker-fold__layer sticker-fold__layer--image"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="sticker-fold__content">
          <span className="sticker-fold__meta">{meta}</span>
          <h3 className="sticker-fold__title" style={{ color: '#F5F0E8', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {title}
          </h3>
          <p className="sticker-fold__desc" style={{ color: '#F5F0E8', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Summary Layer */}
      <div className="sticker-fold__layer sticker-fold__layer--summary">
        <div className="sticker-fold__content">
          <span className="sticker-fold__meta">{meta}</span>
          <h3 className="sticker-fold__title">{title}</h3>
          <p className="sticker-fold__desc">{description}</p>
        </div>
      </div>

      {/* Detail Layer */}
      <div className="sticker-fold__layer sticker-fold__layer--detail">
        <div className="sticker-fold__content">
          <span className="sticker-fold__meta">{meta}</span>
          <h3 className="sticker-fold__title">{title}</h3>
          <p className="sticker-fold__desc">{description}</p>
        </div>
      </div>
    </div>
  );
}
