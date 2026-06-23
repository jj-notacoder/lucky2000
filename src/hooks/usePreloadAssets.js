import { useEffect, useRef, useState } from 'react';

/**
 * Preloads the hero frame sequence AND the web fonts BEFORE the app reveals.
 * Intelligently routing requests based on viewport size, flushing unused asset memory,
 * and utilizing the hardware-decoding Image.decode() API off the main thread.
 *
 * @returns {{ frames: HTMLImageElement[], progress: number, ready: boolean, isMobile: boolean }}
 */
export function usePreloadAssets() {
  const [frames, setFrames] = useState([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const framesRef = useRef([]);

  useEffect(() => {
    // Media query listener for 768px breakpoint
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleBreakpointChange = (e) => {
      setIsMobile(!e.matches);
    };

    // Listen to changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleBreakpointChange);
    } else {
      mediaQuery.addListener(handleBreakpointChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleBreakpointChange);
      } else {
        mediaQuery.removeListener(handleBreakpointChange);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // --- 1) Flush old assets from memory to prevent RAM leaks ---
    if (framesRef.current && framesRef.current.length > 0) {
      framesRef.current.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    }
    framesRef.current = [];
    setFrames([]);
    setReady(false);
    setProgress(0);

    const folder = isMobile 
      ? 'hero section assets - mobile' 
      : 'hero section assets - desktop';
    const count = isMobile ? 51 : 50;
    const extension = isMobile ? 'webp' : 'png';

    const preloadFrames = () =>
      new Promise((resolve) => {
        let loaded = 0;
        const tempFrames = new Array(count);

        const tick = (img, index) => {
          if (cancelled) return;
          tempFrames[index] = img;
          loaded += 1;
          setProgress(loaded / count);
          if (loaded === count) {
            resolve(tempFrames);
          }
        };

        for (let i = 0; i < count; i++) {
          const img = new Image();
          const frameNum = String(i + 1).padStart(3, '0');
          // Relative route enables compatibility under local subdirectories (e.g. /donut 1/)
          const src = `./${folder}/ezgif-frame-${frameNum}.${extension}`;

          img.src = src;
          if (typeof img.decode === 'function') {
            img.decode()
              .then(() => {
                tick(img, i);
              })
              .catch(() => {
                // Fallback if decode rejects
                img.onload = () => tick(img, i);
                img.onerror = () => tick(img, i);
                if (img.complete) tick(img, i);
              });
          } else {
            img.onload = () => tick(img, i);
            img.onerror = () => tick(img, i);
            if (img.complete) tick(img, i);
          }
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

    Promise.all([preloadFrames(), preloadFonts()]).then(([loadedFrames]) => {
      if (!cancelled) {
        framesRef.current = loadedFrames;
        setFrames(loadedFrames);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  return { frames, progress, ready, isMobile };
}
