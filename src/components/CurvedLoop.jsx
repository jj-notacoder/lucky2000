import { useEffect, useRef } from 'react';
import './CurvedLoop.css';

/* Stylized retro line-art doughnut divider (black/white vector). */
function DoughnutMark() {
  return (
    <svg className="curvedloop__donut" viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4">
        <circle cx="32" cy="32" r="22" />
        <circle cx="32" cy="32" r="8" />
        {/* sprinkles */}
        <line x1="20" y1="20" x2="24" y2="24" />
        <line x1="44" y1="20" x2="40" y2="25" />
        <line x1="46" y1="36" x2="41" y2="38" />
        <line x1="22" y1="42" x2="27" y2="39" />
        <line x1="32" y1="12" x2="32" y2="17" />
      </g>
    </svg>
  );
}

/**
 * CurvedLoop — infinite marquee. curveAmount={0} ⇒ a clean straight horizontal
 * loop (best for bilingual readability). Each text instance is separated by a
 * line-art doughnut divider. interactive ⇒ drag to scrub; release to resume.
 */
export default function CurvedLoop({
  marqueeText = '',
  speed = 1.5,
  curveAmount = 0,        // kept 0 = straight
  direction = 'right',
  interactive = true,
  className = '',
}) {
  const groupRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group) return;

    let offset = 0;
    let groupW = group.offsetWidth || 1;
    const dir = direction === 'right' ? 1 : -1;
    let raf = 0;
    let dragging = false;
    let lastX = 0;

    const measure = () => { groupW = group.offsetWidth || 1; };

    const tick = () => {
      if (!dragging) offset += speed * dir;
      // wrap seamlessly within one group width
      if (offset <= -groupW) offset += groupW;
      if (offset >= 0 && dir === 1) offset -= groupW;
      track.style.transform = `translate3d(${offset}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    // drag-to-scrub
    const onDown = (e) => { if (!interactive) return; dragging = true; lastX = e.clientX; track.classList.add('is-grabbing'); };
    const onMove = (e) => { if (!dragging) return; offset += e.clientX - lastX; lastX = e.clientX; };
    const onUp = () => { dragging = false; track.classList.remove('is-grabbing'); };

    measure();
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', measure);
    if (interactive) {
      track.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [speed, direction, interactive, marqueeText]);

  // One "group" = the phrase + divider repeated; rendered twice for a seamless wrap.
  const REPEATS = 4;
  const unit = (key) => (
    <span className="curvedloop__unit" key={key}>
      <span className="curvedloop__text">{marqueeText}</span>
      <DoughnutMark />
    </span>
  );
  const group = (gkey) => (
    <span className="curvedloop__group" ref={gkey === 0 ? groupRef : null} key={gkey}>
      {Array.from({ length: REPEATS }, (_, i) => unit(`${gkey}-${i}`))}
    </span>
  );

  return (
    <div className={`curvedloop ${className}`} data-curve={curveAmount}>
      <div ref={trackRef} className="curvedloop__track">
        {group(0)}
        {group(1)}
      </div>
    </div>
  );
}
