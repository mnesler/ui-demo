import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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

    // Scale up slightly on hover
    const targetScale = hovered ? 1.2 : 1;
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
          emissive={rarityColor}
          emissiveIntensity={glowIntensity}
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

      {/* Glow effect around card edges */}
      {hovered && (
        <>
          <mesh position={[0, 0, cardThickness / 2 + 0.01]}>
            <planeGeometry args={[cardWidth + 0.1, cardHeight + 0.1]} />
            <meshStandardMaterial
              color={rarityColor}
              emissive={rarityColor}
              emissiveIntensity={glowIntensity * 2}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0, -cardThickness / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[cardWidth + 0.1, cardHeight + 0.1]} />
            <meshStandardMaterial
              color={rarityColor}
              emissive={rarityColor}
              emissiveIntensity={glowIntensity * 2}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
