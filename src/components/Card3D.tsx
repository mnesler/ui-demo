import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { CardData } from '../types';
import { RARITY_COLORS, RARITY_GLOW_INTENSITY } from '../types';

interface Card3DProps {
  card: CardData;
  position: [number, number, number];
}

export function Card3D({ card, position }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Animate the card on hover
  useFrame((state) => {
    if (!meshRef.current) return;

    const mesh = meshRef.current as THREE.Mesh & { material: THREE.MeshStandardMaterial };

    // Smoothly transition emissive intensity based on hover state
    const targetIntensity = hovered ? RARITY_GLOW_INTENSITY[card.rarity] : 0;
    mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
      mesh.material.emissiveIntensity,
      targetIntensity,
      0.1
    );

    // Gentle floating animation
    if (hovered) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }

    // Scale up slightly on hover
    const targetScale = hovered ? 1.1 : active ? 1.05 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const rarityColor = RARITY_COLORS[card.rarity];

  return (
    <group position={position}>
      {/* Main card body */}
      <RoundedBox
        ref={meshRef}
        args={[2, 3, 0.1]}
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setActive(!active)}
      >
        <meshStandardMaterial
          color={card.color}
          emissive={rarityColor}
          emissiveIntensity={0}
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Card border glow */}
      <RoundedBox
        args={[2.1, 3.1, 0.05]}
        radius={0.12}
        smoothness={4}
        position={[0, 0, -0.08]}
      >
        <meshStandardMaterial
          color={rarityColor}
          emissive={rarityColor}
          emissiveIntensity={hovered ? RARITY_GLOW_INTENSITY[card.rarity] * 0.5 : 0}
          transparent
          opacity={0.6}
        />
      </RoundedBox>

      {/* Card name */}
      <Text
        position={[0, 1.2, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {card.name}
      </Text>

      {/* Rarity indicator */}
      <Text
        position={[0, 0.9, 0.06]}
        fontSize={0.12}
        color={rarityColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {card.rarity.toUpperCase()}
      </Text>

      {/* Stats */}
      {card.attack !== undefined && (
        <Text
          position={[-0.7, -1.2, 0.06]}
          fontSize={0.25}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ⚔ {card.attack}
        </Text>
      )}

      {card.defense !== undefined && (
        <Text
          position={[0.7, -1.2, 0.06]}
          fontSize={0.25}
          color="#4444ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          🛡 {card.defense}
        </Text>
      )}
    </group>
  );
}
