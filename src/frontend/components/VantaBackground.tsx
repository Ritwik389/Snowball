'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-expect-error no types
import WAVES from 'vanta/dist/vanta.waves.min';

type VantaEffect = {
  destroy: () => void;
};

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const vantaEl = vantaRef.current;

    if (vantaEl && !vantaEffectRef.current) {
      (window as any).THREE = THREE;

      try {
        vantaEffectRef.current = WAVES({
          el: vantaEl,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: 0x453161,
          shininess: 40,
          waveHeight: 20,
          waveSpeed: 1.2,
          zoom: 1
        });
      } catch (err) {
        console.error('Vanta initialization failed:', err);
      }
    }

    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="vanta-container fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: '#000000' }}
    />
  );
};

export default VantaBackground;
