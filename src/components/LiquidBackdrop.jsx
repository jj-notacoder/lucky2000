import { useEffect, useRef } from 'react';

/**
 * LiquidBackdrop — a lightweight, mouse-responsive liquid gradient field drawn
 * on a low-res 2D canvas and blurred via CSS (cheap, 60fps, no WebGL).
 * Colour-weighted blobs drift continuously and lean toward the cursor, warping
 * the field as the mouse moves across the section.
 */
export default function LiquidBackdrop({ colors }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext('2d');
    const palette = colors || ['#ef2e31', '#fbccd4', '#fde67e', '#b6e8de'];

    // Render at a fraction of resolution; CSS blur smooths it into "liquid".
    const SCALE = 0.18;
    let W = 0, H = 0, raf = 0;
    const mouse = { x: 0.5, y: 0.5, active: false };

    const blobs = palette.map((color, i) => ({
      color,
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      pull: 0.04 + i * 0.02, // how strongly this blob leans toward the cursor
    }));

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * SCALE));
      H = Math.max(1, Math.round(r.height * SCALE));
      canvas.width = W; canvas.height = H;
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      for (const b of blobs) {
        // drift
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;
        // lean toward cursor (warps colour weights along the cursor path)
        if (mouse.active) {
          b.x += (mouse.x - b.x) * b.pull * 0.06;
          b.y += (mouse.y - b.y) * b.pull * 0.06;
        }
        const cx = b.x * W, cy = b.y * H;
        const rad = Math.max(W, H) * 0.6;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, b.color);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [colors]);

  return (
    <div ref={wrapRef} className="liquid-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
