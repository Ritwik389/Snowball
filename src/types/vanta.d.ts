declare module 'vanta/dist/vanta.waves.min' {
  import type * as THREE from 'three';

  type VantaEffect = {
    destroy: () => void;
  };

  type VantaOptions = {
    el: HTMLElement;
    THREE: typeof THREE;
    color?: number;
    backgroundColor?: number;
    waveHeight?: number;
  };

  const value: (options: VantaOptions) => VantaEffect;

  export default value;
}
