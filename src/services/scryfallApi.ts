import type { ScryfallCard, CardData } from '../types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';
const DELAY_BETWEEN_REQUESTS = 100; // 100ms as recommended by Scryfall

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchRandomCard(): Promise<CardData | null> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/random`);

    if (!response.ok) {
      console.error('Failed to fetch random card:', response.statusText);
      return null;
    }

    const card: ScryfallCard = await response.json();

    // Some cards don't have image_uris (like double-faced cards)
    if (!card.image_uris) {
      console.warn('Card has no image_uris, fetching another...');
      await delay(DELAY_BETWEEN_REQUESTS);
      return fetchRandomCard();
    }

    return {
      id: card.id,
      name: card.name,
      imageUrl: card.image_uris.large,
      rarity: card.rarity,
    };
  } catch (error) {
    console.error('Error fetching random card:', error);
    return null;
  }
}

export async function fetchRandomCards(count: number): Promise<CardData[]> {
  const cards: CardData[] = [];

  for (let i = 0; i < count; i++) {
    const card = await fetchRandomCard();
    if (card) {
      cards.push(card);
    }

    // Add delay between requests to respect rate limits
    if (i < count - 1) {
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }

  return cards;
}
