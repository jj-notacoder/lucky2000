import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroCanvas.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 50;
const SCROLL_VH = 5;     // pin length = 5 viewport heights
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

    /* ---- cover-fit render (centered, never stretched, RTL-agnostic) ---- */
    const render = (index) => {
      const img = frames[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = viewW / viewH;
      let dw, dh;
      if (boxRatio > imgRatio) { dw = viewW; dh = viewW / imgRatio; }
      else { dh = viewH; dw = viewH * imgRatio; }
      ctx.clearRect(0, 0, viewW, viewH);
      ctx.drawImage(img, (viewW - dw) / 2, (viewH - dh) / 2, dw, dh);
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(currentFrame < 0 ? 0 : currentFrame);
    };

    sizeCanvas();
    render(0);

    /* ---- single pinned, scrubbed timeline drives frames + intro fade ---- */
    const scrollLen = () => window.innerHeight * SCROLL_VH;
    const playhead = { frame: 0 };
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Hand-off (gap-free): keep Frame 50 fully visible all the way through the
    // marquee, then fade the canvas out ONLY as the About section rises in (the
    // same trigger the Warp fades IN on). No blank ever shows between the pin
    // and the marquee. Scroll-position driven → reverses cleanly upward.
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
      rt = setTimeout(() => { sizeCanvas(); ScrollTrigger.refresh(); }, 150);
    };
    window.addEventListener('resize', onResize);

    ScrollTrigger.refresh();

    /* ---- cleanup (React strict-mode / unmount safe) ---- */
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScrollFade);
      clearTimeout(rt);
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
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
