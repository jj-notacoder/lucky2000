import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroCanvas.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 50;
const SCROLL_VH = 5;     // pin length = 5 viewport heights (desktop)
const INTRO_FADE = 0.05; // overlays gone within first 5% of scroll
const MAX_DPR = 2;

/**
 * Full-screen fixed canvas that scrubs the 50-frame slot-machine sequence,
 * pinned via GSAP ScrollTrigger. RTL-safe: the canvas is forced dir="ltr",
 * cover-math uses only width/height, and ScrollTrigger is vertical-only — so
 * Arabic layout never inverts coordinates or breaks the timeline.
 *
 * @param {HTMLImageElement[]} frames  preloaded frame images
 * @param {boolean} ready              true once all assets are cached
 */
export default function HeroCanvas({ frames, ready }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    if (!ready) return; // guardrail: never init tracking before assets are cached

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    let viewW = 0, viewH = 0, dpr = 1, currentFrame = -1;

    /* ---- mathematical cover-fit render (perfectly proportioned on vertical phone screens) ---- */
    const render = (index) => {
      const img = frames[index];
      if (!img || !img.complete || !img.width) return;

      // Calculate scale factor mathematically to cover canvas area
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);

      // Calculate center offsets
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      currentFrame = index;
    };

    const sizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';
      render(currentFrame < 0 ? 0 : currentFrame);
    };

    sizeCanvas();
    render(0);

    /* ---- single pinned, scrubbed timeline driven frames + intro fade ---- */
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      const { isMobile } = context.conditions;
      // Reduce the end value on mobile (2.5 vh) compared to desktop (SCROLL_VH = 5)
      const scrollLen = () => window.innerHeight * (isMobile ? 2.5 : SCROLL_VH);
      const playhead = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: () => '+=' + scrollLen(),
          pin: true,
          scrub: prefersReduced ? true : 1, // smooth, reversible scrubbing
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(playhead, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        duration: 1,
        onUpdate: () => {
          const f = Math.round(playhead.frame);
          if (f !== currentFrame) render(f);
        },
      }, 0);

      // Welcome + scroll cue fade out almost immediately (≈ frame 2 of 50).
      tl.to([introRef.current, cueRef.current], {
        autoAlpha: 0,
        ease: 'none',
        duration: INTRO_FADE,
      }, 0);

      return () => {
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
      };
    });

    // Hand-off (gap-free): keep Frame 50 fully visible all the way through the
    // marquee, then fade the canvas out ONLY as the About section rises in.
    const onScrollFade = () => {
      const about = document.getElementById('about');
      if (!about) { canvas.style.opacity = '1'; return; }
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      canvas.style.opacity = String(1 - p);
    };
    window.addEventListener('scroll', onScrollFade, { passive: true });
    onScrollFade();

    /* ---- debounced resize ---- */
    let rt;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => { 
        sizeCanvas(); 
        ScrollTrigger.refresh(); 
      }, 100);
    };
    window.addEventListener('resize', onResize);

    ScrollTrigger.refresh();

    /* ---- cleanup (React strict-mode / unmount safe) ---- */
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScrollFade);
      clearTimeout(rt);
      mm.revert();
    };
  }, [ready, frames]);

  return (
    <>
      {/* Canvas is its own fixed background layer, forced LTR for coordinate safety */}
      <canvas ref={canvasRef} className="hero-canvas" dir="ltr" aria-hidden="true" />

      <section ref={heroRef} className="hero" id="top">
        {/* Frame-1 overlays — fade out by ≈ frame 2 */}
        <div ref={introRef} className="hero__intro">
          <h1 className="hero__welcome">{t('hero.welcome')}</h1>
          <p className="hero__sub">{t('hero.tagline')}</p>
        </div>
        <div ref={cueRef} className="hero__cue" aria-hidden="true">
          <span className="hero__cue-word">{t('hero.scroll')}</span>
          <span className="hero__cue-line" />
        </div>
      </section>
    </>
  );
}

