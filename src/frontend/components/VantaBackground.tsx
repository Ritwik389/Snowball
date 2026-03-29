'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type VantaEffect = {
  destroy: () => void;
};

declare global {
  interface Window {
    THREE?: typeof THREE;
  }
}

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: VantaEffect | undefined;

    const init = async () => {
      if (!vantaRef.current) return;

      window.THREE = THREE;

      const WAVES = (await import('vanta/dist/vanta.waves.min')).default;

      effect = WAVES({
        el: vantaRef.current,
        THREE: THREE,
        color: 0x38bdf8,
        backgroundColor: 0x020617,
        waveHeight: 30,
      });
    };

    init();

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 z-0"
    />
  );
};

export default VantaBackground;
