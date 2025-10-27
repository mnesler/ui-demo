import { CardScene } from './components/CardScene'
import { sampleCards } from './data/sampleCards'
import './App.css'

function App() {
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
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
          Trading Card Demo
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
      </div>
      <CardScene cards={sampleCards} />
    </>
  )
}

export default App
