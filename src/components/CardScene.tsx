import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Card3D } from './Card3D';
import { getCardEffect } from '../effects/cardEffects';
import type { CardData } from '../types';

interface CardSceneProps {
  cards: CardData[];
}

export function CardScene({ cards }: CardSceneProps) {
  // Calculate fan layout for 7 cards
  const calculateFanPosition = (index: number, total: number): { position: [number, number, number], rotation: [number, number, number] } => {
    const radius = 8; // Distance from center
    const spreadAngle = Math.PI / 3; // 60 degrees total spread
    const angleStep = spreadAngle / (total - 1);
    const startAngle = -spreadAngle / 2;

    const angle = startAngle + (angleStep * index);
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius * 0.3; // Centered vertically
    const z = -Math.cos(angle) * 2; // Depth for 3D fan effect

    // Rotate cards to face the camera
    const rotationY = -angle;
    const rotationX = 0.2; // Slight tilt

    return {
      position: [x, y, z],
      rotation: [rotationX, rotationY, 0]
    };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, toneMapping: 0 }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4169E1" />
        <spotLight
          position={[0, 10, 5]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Render cards in a fan layout */}
        {cards.map((card, index) => {
          const { position, rotation } = calculateFanPosition(index, cards.length);
          const effect = getCardEffect(index);
          return <Card3D key={card.id} card={card} position={position} rotation={rotation} effect={effect} />;
        })}

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={25}
          target={[0, 0, 0]}
        />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
