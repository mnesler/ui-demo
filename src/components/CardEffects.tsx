import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardEffect } from '../effects/cardEffects';

interface CardEffectsProps {
  effect: CardEffect;
  hovered: boolean;
  cardWidth: number;
  cardHeight: number;
}

export function CardEffects({ effect, hovered, cardWidth, cardHeight }: CardEffectsProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Create particles for effects - reduced count for performance
  const { positions, colors } = useMemo(() => {
    const particleCount = effect === 'fire' || effect === 'ice' ? 30 : 20;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position particles around card
      positions[i3] = (Math.random() - 0.5) * cardWidth;
      positions[i3 + 1] = (Math.random() - 0.5) * cardHeight;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Set colors based on effect
      let color: THREE.Color;
      switch (effect) {
        case 'fire':
          color = new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.3);
          break;
        case 'ice':
          color = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.7, 0.7 + Math.random() * 0.2);
          break;
        case 'lightning':
          color = new THREE.Color().setHSL(0.15, 0.8, 0.8 + Math.random() * 0.2);
          break;
        case 'nature':
          color = new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.8, 0.4 + Math.random() * 0.2);
          break;
        case 'water':
          color = new THREE.Color().setHSL(0.55, 0.9, 0.5 + Math.random() * 0.3);
          break;
        case 'earth':
          color = new THREE.Color().setHSL(0.1, 0.6, 0.3 + Math.random() * 0.2);
          break;
        case 'wind':
          color = new THREE.Color().setHSL(0.5, 0.3, 0.8 + Math.random() * 0.2);
          break;
        default:
          color = new THREE.Color(1, 1, 1);
      }

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, colors };
  }, [effect, cardWidth, cardHeight]);

  // Create geometry with buffer attributes - MUST be before conditional return
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [positions, colors]);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current || !hovered) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      const i3 = i;

      switch (effect) {
        case 'fire':
          // Fire rises up
          positions[i3 + 1] += 0.05;
          positions[i3] += Math.sin(time + i) * 0.01;
          if (positions[i3 + 1] > cardHeight / 2 + 1) {
            positions[i3 + 1] = -cardHeight / 2;
            positions[i3] = (Math.random() - 0.5) * cardWidth;
          }
          break;

        case 'ice':
          // Ice crystals float and rotate
          positions[i3 + 1] += Math.sin(time + i) * 0.01;
          positions[i3] += Math.cos(time + i) * 0.01;
          positions[i3 + 2] = Math.sin(time * 2 + i) * 0.3;
          break;

        case 'lightning':
          // Lightning sparks randomly
          if (Math.random() > 0.95) {
            positions[i3] = (Math.random() - 0.5) * cardWidth;
            positions[i3 + 1] = (Math.random() - 0.5) * cardHeight;
          }
          break;

        case 'nature':
          // Nature particles spiral
          const angle = time + i * 0.1;
          const radius = 0.3 + Math.sin(time + i) * 0.2;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = Math.sin(angle) * radius + Math.sin(time * 2 + i) * 0.5;
          break;

        case 'water':
          // Water ripples
          positions[i3 + 1] = Math.sin(time * 2 + i * 0.5) * 0.5;
          positions[i3 + 2] = Math.cos(time * 2 + i * 0.5) * 0.2;
          break;

        case 'earth':
          // Earth particles orbit slowly
          const earthAngle = time * 0.5 + i * 0.2;
          positions[i3] = Math.cos(earthAngle) * (cardWidth * 0.4);
          positions[i3 + 1] = Math.sin(earthAngle) * (cardHeight * 0.4);
          break;

        case 'wind':
          // Wind sweeps across
          positions[i3] += 0.05;
          positions[i3 + 1] += Math.sin(time * 3 + i) * 0.02;
          if (positions[i3] > cardWidth / 2 + 1) {
            positions[i3] = -cardWidth / 2 - 1;
            positions[i3 + 1] = (Math.random() - 0.5) * cardHeight;
          }
          break;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!hovered) return null;

  return (
    <points ref={particlesRef} geometry={geometry} frustumCulled={true}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
        sizeAttenuation={false}
      />
    </points>
  );
}
