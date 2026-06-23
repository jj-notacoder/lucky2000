import { useEffect, useRef } from 'react';
import { Warp } from '@paper-design/shaders-react';

// Brand-tuned Warp config (palette swapped to Lucky 2000 tokens).
const config = {
  proportion: 0.45,
  softness: 1,
  distortion: 0.25,
  swirl: 0.8,
  swirlIterations: 10,
  shape: 'checks',
  shapeScale: 0.1,
  scale: 1,
  rotation: 0,
  speed: 1,
  colors: ['#fde67e', '#fbccd4', '#ef2e31', '#b6e8de'],
};

/**
 * Global animated Warp background (z-index -1, fixed).
 * UX rule: it only appears AFTER the marquee — its opacity is driven by the
 * About section rising into view, so the hero + marquee stay clean.
 */
export default function WarpBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const about = document.getElementById('about');
      if (!about) return;
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 until About starts entering from the bottom, → 1 as it settles.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      el.style.opacity = String(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 w-full h-full z-[-1]"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <Warp style={{ width: '100%', height: '100%' }} {...config} />
    </div>
  );
}
