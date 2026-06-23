/* =========================================================================
   LUCKY 2000 — Hero controller
   - Preloads all 50 WebP frames into memory (with progress)
   - Draws them to a full-screen canvas using object-fit:cover math
   - Pins the hero and scrubs the frame sequence with GSAP ScrollTrigger
   - Fades the "Welcome" + scroll cue within the first 5% of scroll
   Mobile-first, debounced resize, reduced-motion aware, memory-conscious.
   ========================================================================= */

(function () {
  'use strict';

  /* ----------------------------- CONFIG --------------------------------- */
  const FRAME_COUNT  = 50;                       // exactly 50 frames
  const FRAME_DIR    = 'assets/frames/';         // 0001.webp … 0050.webp
  const SCROLL_VH    = 5;                        // pin length = 5 viewport heights
  const INTRO_FADE   = 0.05;                     // fade overlays over first 5% of scroll
  const MAX_DPR      = 2;                        // cap devicePixelRatio (perf + memory)

  // Build a zero-padded frame path: 1 -> "assets/frames/0001.webp"
  const framePath = (n) => FRAME_DIR + String(n).padStart(4, '0') + '.webp';

  /* ----------------------------- ELEMENTS ------------------------------- */
  const canvas     = document.getElementById('hero-canvas');
  const ctx        = canvas.getContext('2d', { alpha: false }); // opaque = faster
  const preloader  = document.getElementById('preloader');
  const pctEl      = document.getElementById('loadPct');
  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------- STATE ---------------------------------- */
  const frames = new Array(FRAME_COUNT); // holds the 50 Image objects
  let viewW = 0, viewH = 0, dpr = 1;     // current CSS viewport + pixel ratio
  let currentFrame = 0;                  // last frame index drawn (0-based)

  /* ----------------------- SMALL UTILITIES ------------------------------ */
  // Debounce: run `fn` only after `wait` ms of silence (used for resize).
  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  /* ======================================================================
     CANVAS SIZING  — true object-fit:cover, centered, never stretched
     ====================================================================== */
  // Resize the backing store to the viewport * DPR, then scale the context
  // so we can do all our drawing math in clean CSS pixels.
  function sizeCanvas() {
    dpr   = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    viewW = window.innerWidth;
    viewH = window.innerHeight;

    canvas.width        = Math.round(viewW * dpr);  // real device pixels
    canvas.height       = Math.round(viewH * dpr);
    canvas.style.width  = viewW + 'px';             // CSS size
    canvas.style.height = viewH + 'px';

    // 1 unit in our draw calls == 1 CSS pixel == dpr device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    render(currentFrame); // repaint immediately after a resize/rotate
  }

  // Draw a single frame, scaled with "cover" logic (fills viewport, centered,
  // cropping the overflow — aspect ratio always preserved).
  function render(index) {
    const img = frames[index];
    // Guard: frame may not be decoded yet (or failed to load).
    if (!img || !img.complete || !img.naturalWidth) return;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = viewW / viewH;

    let drawW, drawH;
    if (boxRatio > imgRatio) {
      // Viewport is wider than the image → match width, overflow height.
      drawW = viewW;
      drawH = viewW / imgRatio;
    } else {
      // Viewport is taller/narrower → match height, overflow width.
      drawH = viewH;
      drawW = viewH * imgRatio;
    }

    const dx = (viewW - drawW) / 2; // center horizontally
    const dy = (viewH - drawH) / 2; // center vertically

    ctx.clearRect(0, 0, viewW, viewH);
    ctx.drawImage(img, dx, dy, drawW, drawH);
    currentFrame = index;
  }

  /* ======================================================================
     PRELOADER  — load every frame, report progress, resolve when all cached
     ====================================================================== */
  function preloadFrames(onProgress) {
    return new Promise((resolve) => {
      let loaded = 0;

      const tick = () => {
        loaded += 1;
        onProgress(loaded / FRAME_COUNT);
        if (loaded === FRAME_COUNT) resolve();
      };

      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.decoding = 'async';
        // Count both success and failure so a single bad file can't hang the app.
        img.onload  = tick;
        img.onerror = tick;
        img.src = framePath(i + 1);
        frames[i] = img; // keep a reference so it stays in memory / cache
      }
    });
  }

  function hidePreloader() {
    preloader.classList.add('preloader--hidden');
    // Remove from the DOM after the fade so it never traps focus or clicks.
    preloader.addEventListener('transitionend', () => {
      preloader.style.display = 'none';
    }, { once: true });
  }

  /* ======================================================================
     SCROLL SEQUENCE  — GSAP ScrollTrigger pins the hero + scrubs frames
     ====================================================================== */
  function initScroll() {
    // If GSAP failed to load (e.g. offline), degrade gracefully:
    // show the last/jackpot frame statically and bail.
    if (!window.gsap || !window.ScrollTrigger) {
      render(FRAME_COUNT - 1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Pin length, recomputed on refresh so it stays correct after rotation.
    const scrollLen = () => window.innerHeight * SCROLL_VH;

    // We animate a plain object's `frame` from 0 → 49 and draw on update.
    const playhead = { frame: 0 };

    // ONE pinned, scrubbed timeline controls everything. (Two separate
    // ScrollTriggers sharing the same PINNED trigger element fight over the
    // geometry the pin rewrites — so we drive both the frame sequence and the
    // intro fade from a single timeline instead.)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: () => '+=' + scrollLen(),
        pin: true,
        // scrub: 1 → smooth catch-up easing; plays forward on scroll-down and
        // reverses on scroll-up automatically. Lower = snappier, higher = floatier.
        scrub: prefersReduced ? true : 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,   // recompute end()/lengths on resize
      },
    });

    // Frame sequence spans the FULL timeline (duration 1 = 100% of scroll).
    tl.to(playhead, {
      frame: FRAME_COUNT - 1,
      ease: 'none',                  // linear; the cinematic feel comes from scrub
      duration: 1,
      onUpdate: () => {
        // Round to the nearest integer frame and only redraw when it changes.
        const f = Math.round(playhead.frame);
        if (f !== currentFrame) render(f);
      },
    }, 0);

    // Intro fade occupies only the first 5% of the timeline (0 → 0.05), so the
    // "Welcome" + scroll cue are fully gone before the sky turns to sunset.
    tl.to('#hero-intro, #hero-cue', {
      autoAlpha: 0,                  // animates opacity + sets visibility:hidden at 0
      ease: 'none',
      duration: INTRO_FADE,
    }, 0);
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function init() {
    sizeCanvas();

    // Paint frame 1 the moment it is ready (behind the loader) for a clean reveal.
    if (frames[0]) {
      frames[0].addEventListener('load', () => render(0), { once: true });
    }

    preloadFrames((p) => {
      pctEl.textContent = Math.round(p * 100);
    }).then(() => {
      render(0);          // ensure first frame is on screen
      hidePreloader();    // fade the loader away
      initScroll();       // wire up the pinned scroll sequence
      // ScrollTrigger measures layout after fonts/layout settle.
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    // Redraw on resize / orientation change (debounced to avoid thrashing).
    window.addEventListener('resize', debounce(() => {
      sizeCanvas();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 150));
  }

  /* ----------------- MEMORY MANAGEMENT NOTE -----------------------------
     50 decoded 1280×720 frames live in `frames[]` for instant, stutter-free
     scrubbing — that is the intentional trade-off for a buttery hero. If you
     ever need to reclaim memory (e.g. a very long page / low-end devices),
     you can null out the array once the user has scrolled past the hero:

       ScrollTrigger.create({
         trigger: '#about', start: 'top bottom',
         once: true,
         onEnter: () => { for (let i = 0; i < frames.length; i++) frames[i] = null; }
       });

     We keep them by default so scrolling back up stays instant.
  ----------------------------------------------------------------------- */

  // Kick off once the DOM is parsed (scripts are deferred, so this is safe).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
