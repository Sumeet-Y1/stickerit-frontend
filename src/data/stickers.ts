export interface Sticker {
  id: number;
  image: string;
  tags: string[];
  creator: string;
  creatorAvatar: string;
  height: number; // percentage for varied masonry heights
}

export const allStickers: Sticker[] = [
  { id: 1, image: '/images/stickers/sticker-1.png', tags: ['cute', 'animals', 'kawaii'], creator: 'pixelpaws', creatorAvatar: '/images/stickers/sticker-1.png', height: 280 },
  { id: 2, image: '/images/stickers/sticker-2.png', tags: ['plants', 'nature', 'cozy'], creator: 'greenthumb', creatorAvatar: '/images/stickers/sticker-2.png', height: 240 },
  { id: 3, image: '/images/stickers/sticker-3.png', tags: ['coffee', 'cozy', 'food'], creator: 'baristabot', creatorAvatar: '/images/stickers/sticker-3.png', height: 300 },
  { id: 4, image: '/images/stickers/sticker-4.png', tags: ['space', 'tech', 'fun'], creator: 'rocketkid', creatorAvatar: '/images/stickers/sticker-4.png', height: 320 },
  { id: 5, image: '/images/stickers/sticker-5.png', tags: ['night', 'cute', 'dreamy'], creator: 'lunartica', creatorAvatar: '/images/stickers/sticker-5.png', height: 260 },
  { id: 6, image: '/images/stickers/sticker-6.png', tags: ['halloween', 'cute', 'spooky'], creator: 'ghostclub', creatorAvatar: '/images/stickers/sticker-6.png', height: 290 },
  { id: 7, image: '/images/stickers/sticker-7.png', tags: ['rainbow', 'cheerful', 'sky'], creator: 'colorwheel', creatorAvatar: '/images/stickers/sticker-7.png', height: 220 },
  { id: 8, image: '/images/stickers/sticker-8.png', tags: ['music', 'retro', 'vintage'], creator: 'vinylvibes', creatorAvatar: '/images/stickers/sticker-8.png', height: 310 },
  { id: 9, image: '/images/stickers/sticker-9.png', tags: ['nature', 'pond', 'cute'], creator: 'frogpond', creatorAvatar: '/images/stickers/sticker-9.png', height: 250 },
  { id: 10, image: '/images/stickers/sticker-10.png', tags: ['magic', 'stars', 'night'], creator: 'stardusty', creatorAvatar: '/images/stickers/sticker-10.png', height: 270 },
  { id: 11, image: '/images/stickers/sticker-11.png', tags: ['love', 'mail', 'cute'], creator: 'loveletters', creatorAvatar: '/images/stickers/sticker-11.png', height: 230 },
  { id: 12, image: '/images/stickers/sticker-12.png', tags: ['winter', 'animals', 'cozy'], creator: 'arcticart', creatorAvatar: '/images/stickers/sticker-12.png', height: 300 },
  { id: 13, image: '/images/stickers/sticker-13.png', tags: ['fantasy', 'cute', 'home'], creator: 'fairytales', creatorAvatar: '/images/stickers/sticker-13.png', height: 340 },
  { id: 14, image: '/images/stickers/sticker-14.png', tags: ['bugs', 'cute', 'spring'], creator: 'buzzybee', creatorAvatar: '/images/stickers/sticker-14.png', height: 260 },
  { id: 15, image: '/images/stickers/sticker-15.png', tags: ['books', 'cozy', 'reading'], creator: 'bookworm', creatorAvatar: '/images/stickers/sticker-15.png', height: 280 },
  { id: 16, image: '/images/stickers/sticker-16.png', tags: ['space', 'planets', 'cosmic'], creator: 'cosmosart', creatorAvatar: '/images/stickers/sticker-16.png', height: 290 },
  { id: 17, image: '/images/stickers/sticker-17.png', tags: ['flowers', 'happy', 'nature'], creator: 'sunnyblooms', creatorAvatar: '/images/stickers/sticker-17.png', height: 320 },
  { id: 18, image: '/images/stickers/sticker-18.png', tags: ['camping', 'outdoors', 'cozy'], creator: 'trailmix', creatorAvatar: '/images/stickers/sticker-18.png', height: 250 },
  { id: 19, image: '/images/stickers/sticker-19.png', tags: ['food', 'cute', 'drinks'], creator: 'bobafiles', creatorAvatar: '/images/stickers/sticker-19.png', height: 330 },
  { id: 20, image: '/images/stickers/sticker-20.png', tags: ['energy', 'bolt', 'power'], creator: 'zapstudio', creatorAvatar: '/images/stickers/sticker-20.png', height: 270 },
  { id: 21, image: '/images/stickers/sticker-21.png', tags: ['ocean', 'whale', 'peaceful'], creator: 'deepblue', creatorAvatar: '/images/stickers/sticker-21.png', height: 260 },
  { id: 22, image: '/images/stickers/sticker-22.png', tags: ['music', 'headphones', 'beats'], creator: 'audiophile', creatorAvatar: '/images/stickers/sticker-22.png', height: 290 },
  { id: 23, image: '/images/stickers/sticker-23.png', tags: ['plants', 'desert', 'cute'], creator: 'cactusclub', creatorAvatar: '/images/stickers/sticker-23.png', height: 340 },
  { id: 24, image: '/images/stickers/sticker-24.png', tags: ['paper', 'flight', 'simple'], creator: 'origamist', creatorAvatar: '/images/stickers/sticker-24.png', height: 240 },
  { id: 25, image: '/images/stickers/sticker-25.png', tags: ['weather', 'rainbow', 'sky'], creator: 'cloudnine', creatorAvatar: '/images/stickers/sticker-25.png', height: 280 },
];

export interface Creator {
  id: number;
  name: string;
  role: string;
  stickerCount: number;
  color: string;
}

export const creators: Creator[] = [
  { id: 1, name: 'Mia Chen', role: 'Pixel Artist', stickerCount: 142, color: '#E8604C' },
  { id: 2, name: 'Jake Rios', role: 'GIF Animator', stickerCount: 89, color: '#7AADA0' },
  { id: 3, name: 'Sora Kim', role: 'Illustrator', stickerCount: 215, color: '#2A5040' },
  { id: 4, name: 'Zoe Park', role: 'Character Designer', stickerCount: 178, color: '#E8C4B0' },
  { id: 5, name: 'Leo Tanaka', role: 'Motion Artist', stickerCount: 96, color: '#B5CEBC' },
];
