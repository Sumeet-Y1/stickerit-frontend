import { useEffect, useState } from 'react';
import { readLikedStickerIds, readSavedStickerIds, toggleStoredId } from '../lib/backend';

export function useStickerInteractions() {
  const [likedIds, setLikedIds] = useState<string[]>(() => readLikedStickerIds());
  const [savedIds, setSavedIds] = useState<string[]>(() => readSavedStickerIds());

  useEffect(() => {
    setLikedIds(readLikedStickerIds());
    setSavedIds(readSavedStickerIds());
  }, []);

  const toggleLike = (id: string) => setLikedIds(toggleStoredId('stickerit:liked', id));
  const toggleSave = (id: string) => setSavedIds(toggleStoredId('stickerit:saved', id));

  return {
    likedIds,
    savedIds,
    toggleLike,
    toggleSave,
  };
}

