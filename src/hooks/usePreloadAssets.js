import { useEffect, useRef, useState } from 'react';

/**
 * Preloads the hero frame sequence AND the web fonts BEFORE the app reveals,
 * so there is no FOUT, no layout shift, and zero scroll stutter on first paint.
 *
 * @param {number} frameCount  number of frames (50)
 * @param {string} dir         public path, e.g. '/frames/'
 * @returns {{ frames: HTMLImageElement[], progress: number, ready: boolean }}
 */
export function usePreloadAssets(frameCount, dir) {
  const framesRef = useRef(new Array(frameCount));
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const path = (n) => `${dir}${String(n).padStart(4, '0')}.webp`;

    // --- 1) Frames -------------------------------------------------------
    const preloadFrames = () =>
      new Promise((resolve) => {
        let loaded = 0;
        const tick = () => {
          loaded += 1;
          if (!cancelled) setProgress(loaded / frameCount);
          if (loaded === frameCount) resolve();
        };
        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.decoding = 'async';
          img.onload = tick;
          img.onerror = tick; // never hang on a single bad file
          img.src = path(i + 1);
          framesRef.current[i] = img;
        }
      });

    // --- 2) Fonts (preload BOTH languages so swapping never flashes) ------
    const preloadFonts = () => {
      if (!('fonts' in document)) return Promise.resolve();
      const faces = [
        '700 1em Bitter',   // EN display (Clarendon stand-in)
        '500 1em Lora',     // EN body
        '400 1em Lalezar',  // AR display (Modhesh stand-in)
      ];
      return Promise.all(
        faces.map((f) => document.fonts.load(f).catch(() => null))
      ).then(() => document.fonts.ready);
    };

    Promise.all([preloadFrames(), preloadFonts()]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => { cancelled = true; };
  }, [frameCount, dir]);

  return { frames: framesRef.current, progress, ready };
}
