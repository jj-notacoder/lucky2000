import { useRef } from 'react';
import './BorderGlow.css';

/**
 * BorderGlow — wraps a card so its border lights up with a brand-coloured glow
 * that follows the cursor. The glow is a radial gradient masked to the border
 * ring (the classic gradient-border trick), brightened where the cursor is.
 *
 * Extra props (className, onMouseEnter, onClick, style…) are forwarded to the
 * wrapper so it can also act as a flex item / accordion trigger.
 */
export default function BorderGlow({
  children,
  colors = ['#ef2e31', '#fde67e', '#b6e8de'],
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  backgroundColor = 'rgba(253, 246, 227, 0.10)',
  animated = false,
  className = '',
  style = {},
  ...rest
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.style.setProperty('--on', '1');
  };
  const onLeave = () => ref.current && ref.current.style.setProperty('--on', '0');

  // Cursor-anchored radial gradient cycling the brand colours.
  const c = colors.length ? colors : ['#ef2e31', '#fde67e', '#b6e8de'];
  const glow = `radial-gradient(${glowRadius * 6}px circle at var(--mx,50%) var(--my,50%), ${c[0]}, ${
    c[1] || c[0]
  } 38%, ${c[2] || c[0]} 66%, transparent 80%)`;

  return (
    <div
      ref={ref}
      className={`border-glow ${animated ? 'border-glow--animated' : ''} ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        '--bg': backgroundColor,
        '--r': `${borderRadius}px`,
        '--glow': glow,
        '--intensity': glowIntensity,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      {...rest}
    >
      <span className="border-glow__ring" aria-hidden="true" />
      <div className="border-glow__content">{children}</div>
    </div>
  );
}
