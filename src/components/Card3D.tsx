import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardData } from '../types';
import { RARITY_COLORS, RARITY_GLOW_INTENSITY } from '../types';
import type { CardEffect } from '../effects/cardEffects';
import { CardEffects } from './CardEffects';
import type { ThreeEvent } from '@react-three/fiber';

interface Card3DProps {
  card: CardData;
  position: [number, number, number];
  rotation: [number, number, number];
  effect: CardEffect;
}

export function Card3D({ card, position, rotation, effect }: Card3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset] = useState(new THREE.Vector3());
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

  // Load texture and ensure it doesn't repeat or stretch
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(card.imageUrl);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [card.imageUrl]);

  // Animate the card on hover
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Frame-rate independent animation using delta time
    const smoothFactor = 1 - Math.pow(0.001, delta);
    const fastSmoothFactor = 1 - Math.pow(0.0001, delta);

    if (!isDragging) {
      // Gentle floating animation
      if (hovered) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], smoothFactor);
      }

      // Snap back to original position when not dragging - smooth and fast
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], smoothFactor);

      // Bring hovered card slightly forward to prevent clipping - instant
      const targetZ = hovered || isDragging ? position[2] + 0.2 : position[2];
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, fastSmoothFactor);
    }

    // Scale up more on hover - buttery smooth animation
    const targetScale = hovered || isDragging ? 1.4 : 1;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, smoothFactor);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  const rarityColor = RARITY_COLORS[card.rarity];
  const glowIntensity = hovered ? RARITY_GLOW_INTENSITY[card.rarity] : 0;

  // Magic card aspect ratio is 2.5:3.5 (5:7)
  const cardWidth = 2.5;
  const cardHeight = 3.5;
  const cardThickness = 0.05;

  const { raycaster } = useThree();

  // Handle drag start
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);

    if (groupRef.current) {
      // Calculate intersection point
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlaneRef.current, intersectionPoint);

      // Store offset from card position to click point
      dragOffset.subVectors(groupRef.current.position, intersectionPoint);
    }
  };

  // Handle dragging
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      event.stopPropagation();

      // Calculate new position based on mouse
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlaneRef.current, intersectionPoint);

      // Update card position
      groupRef.current.position.copy(intersectionPoint.add(dragOffset));
    }
  };

  // Handle drag end
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card front face with texture */}
      <mesh
        position={[0, 0, cardThickness / 2]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
            color="#ff0000"
            emissive="#ff4444"
            emissiveIntensity={glowIntensity * 2.0}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Ice effect overlay - on back */}
      {hovered && effect === 'ice' && (
        <mesh position={[0, 0, -cardThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth + 0.2, cardHeight + 0.2]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff4444"
            emissiveIntensity={1.6}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Fire effect overlay - on back */}
      {hovered && effect === 'fire' && (
        <mesh position={[0, 0, -cardThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth + 0.2, cardHeight + 0.2]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff4444"
            emissiveIntensity={2.4}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Particle effects for each element */}
      <CardEffects effect={effect} hovered={hovered} cardWidth={cardWidth} cardHeight={cardHeight} />
    </group>
  );
}
