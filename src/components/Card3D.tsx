import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardData } from '../types';
import { RARITY_COLORS, RARITY_GLOW_INTENSITY } from '../types';
import type { CardEffect } from '../effects/cardEffects';
import { CardEffects } from './CardEffects';

interface Card3DProps {
  card: CardData;
  position: [number, number, number];
  rotation: [number, number, number];
  effect: CardEffect;
}

export function Card3D({ card, position, rotation, effect }: Card3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Load texture and ensure it doesn't repeat or stretch
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(card.imageUrl);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [card.imageUrl]);

  // Animate the card on hover
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle floating animation
    if (hovered) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
    }

    // Scale up more on hover - each card gets bigger
    const targetScale = hovered ? 1.4 : 1;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  const rarityColor = RARITY_COLORS[card.rarity];
  const glowIntensity = hovered ? RARITY_GLOW_INTENSITY[card.rarity] : 0;

  // Magic card aspect ratio is 2.5:3.5 (5:7)
  const cardWidth = 2.5;
  const cardHeight = 3.5;
  const cardThickness = 0.05;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card front face with texture */}
      <mesh
        position={[0, 0, cardThickness / 2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Card back face (black) */}
      <mesh position={[0, 0, -cardThickness / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive={rarityColor}
          emissiveIntensity={glowIntensity * 0.3}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Card edges (sides) */}
      <mesh position={[cardWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[cardThickness, cardHeight]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-cardWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[cardThickness, cardHeight]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, cardHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cardWidth, cardThickness]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -cardHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cardWidth, cardThickness]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Glow effect around card edges - only on back */}
      {hovered && (
        <mesh position={[0, 0, -cardThickness / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth + 0.15, cardHeight + 0.15]} />
          <meshStandardMaterial
            color="#aaaaaa"
            emissive="#cccccc"
            emissiveIntensity={glowIntensity * 1.0}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Ice effect overlay - on back */}
      {hovered && effect === 'ice' && (
        <mesh position={[0, 0, -cardThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth + 0.2, cardHeight + 0.2]} />
          <meshStandardMaterial
            color="#6699cc"
            emissive="#88bbee"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Fire effect overlay - on back */}
      {hovered && effect === 'fire' && (
        <mesh position={[0, 0, -cardThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth + 0.2, cardHeight + 0.2]} />
          <meshStandardMaterial
            color="#ee6600"
            emissive="#ff8800"
            emissiveIntensity={1.2}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Particle effects for each element */}
      <CardEffects effect={effect} hovered={hovered} cardWidth={cardWidth} cardHeight={cardHeight} />
    </group>
  );
}
