export interface ScryfallCard {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
}

export interface CardData {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
}

export const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#4169E1',
  rare: '#FFD700',
  mythic: '#FF4500',
} as const;

export const RARITY_GLOW_INTENSITY = {
  common: 0.5,
  uncommon: 1.0,
  rare: 1.5,
  mythic: 2.5,
} as const;
