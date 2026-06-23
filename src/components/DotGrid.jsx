import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* hex -> {r,g,b} */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * DotGrid — canvas dot matrix with cursor-proximity colour swap and a click
 * shockwave that ripples dots outward, then springs them home.
 * Dependency-free physics (GSAP core for the return tween — no premium plugins).
 */
export default function DotGrid({
  dotSize = 4,
  gap = 18,
  baseColor = '#ef2e31',
  activeColor = '#b6e8de',
  proximity = 140,
  shockRadius = 200,
  shockStrength = 8,
  resistance = 600,
  returnDuration = 1.2,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const base = hexToRgb(baseColor);
    const active = hexToRgb(activeColor);

    let dots = [];
    let W = 0, H = 0, dpr = 1, raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const step = gap + dotSize;
      const cols = Math.floor((W + gap) / step);
      const rows = Math.floor((H + gap) / step);
      const offX = (W - (cols - 1) * step) / 2;
      const offY = (H - (rows - 1) * step) / 2;
      dots = [];
      for (let yi = 0; yi < rows; yi++) {
        for (let xi = 0; xi < cols; xi++) {
          dots.push({ cx: offX + xi * step, cy: offY + yi * step, ox: 0, oy: 0 });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        const x = d.cx + d.ox;
        const y = d.cy + d.oy;
        // proximity colour swap
        const dx = x - mouse.x, dy = y - mouse.y;
        const dist = Math.hypot(dx, dy);
        let t = dist < proximity ? 1 - dist / proximity : 0;
        const rC = Math.round(base.r + (active.r - base.r) * t);
        const gC = Math.round(base.g + (active.g - base.g) * t);
        const bC = Math.round(base.b + (active.b - base.b) * t);
        ctx.beginPath();
        ctx.fillStyle = `rgb(${rC},${gC},${bC})`;
        ctx.arc(x, y, dotSize / 2 + t * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    // Click → shockwave: push nearby dots out, then spring back home.
    const onClick = (e) => {
      const r = wrap.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      for (const d of dots) {
        const dx = d.cx - px, dy = d.cy - py;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < shockRadius) {
          const falloff = 1 - dist / shockRadius;
          // resistance damps how far dots travel; shockStrength scales the push
          const push = (shockStrength * 6 * falloff) / (1 + resistance / 2000);
          gsap.killTweensOf(d);
          d.ox = (dx / dist) * push;
          d.oy = (dy / dist) * push;
          gsap.to(d, { ox: 0, oy: 0, duration: returnDuration, ease: 'elastic.out(1,0.45)' });
        }
      }
    };

    build();
    draw();
    window.addEventListener('resize', build);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('pointerdown', onClick);

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(dots);
      window.removeEventListener('resize', build);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointerdown', onClick);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, resistance, returnDuration]);

  return (
    <div ref={wrapRef} className="dotgrid" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
