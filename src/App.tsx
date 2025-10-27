import { useState, useEffect } from 'react'
import { CardScene } from './components/CardScene'
import { fetchRandomCards } from './services/scryfallApi'
import type { CardData } from './types'
import './App.css'

function App() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCards = await fetchRandomCards(7);
      if (fetchedCards.length === 0) {
        setError('Failed to load cards. Please refresh.');
      } else {
        setCards(fetchedCards);
      }
    } catch (err) {
      setError('Error loading cards from Scryfall');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        zIndex: 1000,
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '300px',
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
          Magic Card Fan Demo
        </h1>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          🖱️ Hover over cards to see bloom effects
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          🎮 Click and drag to rotate view
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          🔍 Scroll to zoom in/out
        </p>
        <button
          onClick={loadCards}
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: loading ? '#555' : '#4169E1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {loading ? 'Loading...' : 'Draw New Cards'}
        </button>
        {error && (
          <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '10px' }}>
            {error}
          </p>
        )}
        <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.7 }}>
          Cards from Scryfall.com
        </p>
      </div>

      {loading && cards.length === 0 ? (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: 'white',
          fontSize: '24px',
          fontFamily: 'monospace',
        }}>
          Loading cards from Scryfall...
        </div>
      ) : cards.length > 0 ? (
        <CardScene cards={cards} />
      ) : null}
    </>
  )
}

export default App
