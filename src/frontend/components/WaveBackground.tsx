'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WaveBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x020617); // dark bg
    mount.appendChild(renderer.domElement);

    // 🌊 Create wave grid
    const geometry = new THREE.PlaneGeometry(20, 10, 100, 50);

    const material = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2.5;
    scene.add(plane);

    let time = 0;

    // ✨ Animation
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.03;

      const positions = plane.geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        const wave =
          Math.sin(x * 0.5 + time) +
          Math.cos(y * 0.5 + time);

        positions.setZ(i, wave * 0.3);
      }

      positions.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 📱 Resize fix
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}