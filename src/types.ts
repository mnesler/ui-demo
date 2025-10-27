export interface CardData {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  attack?: number;
  defense?: number;
}

export const RARITY_COLORS = {
  common: '#888888',
  rare: '#4169E1',
  epic: '#9370DB',
  legendary: '#FFD700',
} as const;

export const RARITY_GLOW_INTENSITY = {
  common: 0.5,
  rare: 1.0,
  epic: 1.5,
  legendary: 2.5,
} as const;
