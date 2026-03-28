'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import FOG from 'vanta/dist/vanta.fog.min';

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    const vantaEl = vantaRef.current;
    
    if (vantaEl && !vantaEffectRef.current) {
        // Vanta needs THREE on the window object
        (window as any).THREE = THREE;
        
        try {
            vantaEffectRef.current = FOG({
                el: vantaEl,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.0,
                minWidth: 200.0,
                highlightColor: 0xff00ff,
                midtoneColor: 0x240046,
                lowlightColor: 0x10002b,
                baseColor: 0x05051a,
                blurFactor: 0.9,
                speed: 2.5,
                zoom: 1.0,
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
  }, []); // Run ONLY once on mount

  return (
    <div 
        ref={vantaRef} 
        className="vanta-container fixed inset-0 -z-10 pointer-events-none" 
        style={{ backgroundColor: '#05051a' }}
    />
  );
};

export default VantaBackground;
