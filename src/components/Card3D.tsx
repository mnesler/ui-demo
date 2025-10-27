import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { CardData } from '../types';
import { RARITY_COLORS, RARITY_GLOW_INTENSITY } from '../types';

interface Card3DProps {
  card: CardData;
  position: [number, number, number];
  rotation: [number, number, number];
}

export function Card3D({ card, position, rotation }: Card3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [texture] = useState(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(card.imageUrl);
  });

  // Animate the card on hover
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle floating animation
    if (hovered) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
    }

    // Scale up slightly on hover
    const targetScale = hovered ? 1.2 : 1;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  const rarityColor = RARITY_COLORS[card.rarity];
  const glowIntensity = hovered ? RARITY_GLOW_INTENSITY[card.rarity] : 0;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card front with texture */}
      <RoundedBox
        args={[2.5, 3.5, 0.05]}
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          map={texture}
          emissive={rarityColor}
          emissiveIntensity={glowIntensity}
          metalness={0.1}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Card back (black) */}
      <RoundedBox
        args={[2.5, 3.5, 0.05]}
        radius={0.1}
        smoothness={4}
        position={[0, 0, -0.05]}
      >
        <meshStandardMaterial
          color="#1a1a1a"
          emissive={rarityColor}
          emissiveIntensity={glowIntensity * 0.3}
          metalness={0.5}
          roughness={0.5}
        />
      </RoundedBox>

      {/* Glow border effect */}
      {hovered && (
        <RoundedBox
          args={[2.6, 3.6, 0.04]}
          radius={0.12}
          smoothness={4}
          position={[0, 0, 0.01]}
        >
          <meshStandardMaterial
            color={rarityColor}
            emissive={rarityColor}
            emissiveIntensity={glowIntensity * 1.5}
            transparent
            opacity={0.4}
          />
        </RoundedBox>
      )}
    </group>
  );
}
