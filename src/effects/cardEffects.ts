// Different effect types for cards
export type CardEffect =
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'nature'
  | 'water'
  | 'earth'
  | 'wind';

export const CARD_EFFECTS: CardEffect[] = [
  'fire',
  'ice',
  'lightning',
  'nature',
  'water',
  'earth',
  'wind'
];

// Assign effects to cards in order
export function getCardEffect(index: number): CardEffect {
  return CARD_EFFECTS[index % CARD_EFFECTS.length];
}
