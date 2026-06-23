import { useRef, useState } from 'react';
import gsap from 'gsap';
import './FlowingMenu.css';

/** A single menu row with edge-aware GSAP marquee reveal. */
function MenuItem({ item, speed, isCta, onEnter, onLeave }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const innerRef = useRef(null);

  const edgeFrom = (e) => {
    const r = itemRef.current.getBoundingClientRect();
    return e.clientY - r.top < r.height / 2 ? 'top' : 'bottom';
  };

  const handleEnter = (e) => {
    onEnter();
    const ed = edgeFrom(e);
    gsap.killTweensOf(marqueeRef.current);
    // Slide the whole overlay in from the edge the cursor entered.
    gsap
      .timeline({ defaults: { duration: 0.5, ease: 'expo.out' } })
      .set(marqueeRef.current, { yPercent: ed === 'top' ? -101 : 101 })
      .to(marqueeRef.current, { yPercent: 0 });
  };

  const handleLeave = (e) => {
    onLeave();
    const ed = edgeFrom(e);
    gsap.killTweensOf(marqueeRef.current);
    // Slide it back out toward the edge the cursor exits.
    gsap
      .timeline({ defaults: { duration: 0.45, ease: 'expo.in' } })
      .to(marqueeRef.current, { yPercent: ed === 'top' ? -101 : 101 });
  };

  const reps = Array.from({ length: 8 });
  const external = item.link.startsWith('http');

  return (
    <div className="fm-item" ref={itemRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a
        className={`fm-link ${isCta ? 'is-cta' : ''}`}
        href={item.link}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.text}
        {isCta && <span className="fm-link__badge">↗ Instagram</span>}
      </a>

      <div className="fm-marquee" ref={marqueeRef} aria-hidden="true">
        <div className="fm-marquee__inner" ref={innerRef}>
          <div className="fm-marquee__track" style={{ animationDuration: `${speed}s` }}>
            {reps.map((_, k) => (
              <span className="fm-marquee__cell" key={k}>
                <span className="fm-marquee__text">{item.text}</span>
                <span className="fm-marquee__dot">{isCta ? '★' : '•'}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FlowingMenu — vertical flavour list. Hovering a row:
 *  • slides in a marquee strip (edge-aware, React Bits signature), and
 *  • shows TWO donut images (top-down + cross-section) following the cursor.
 * The final item is a golden "New Flavour" CTA linking to Instagram.
 */
export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#ffffff',
  bgColor = '#120F17',
  marqueeBgColor = '#ffffff',
  marqueeTextColor = '#120F17',
  borderColor = '#ffffff',
}) {
  const [hover, setHover] = useState(null);
  const cursorRef = useRef(null);

  const onMove = (e) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  };

  return (
    <div
      className="flowing-menu"
      onPointerMove={onMove}
      style={{
        '--fm-bg': bgColor,
        '--fm-text': textColor,
        '--fm-mq-bg': marqueeBgColor,
        '--fm-mq-text': marqueeTextColor,
        '--fm-border': borderColor,
      }}
    >
      {items.map((it, i) => (
        <MenuItem
          key={i}
          item={it}
          speed={speed}
          isCta={i === items.length - 1}
          onEnter={() => setHover(i)}
          onLeave={() => setHover((h) => (h === i ? null : h))}
        />
      ))}

      {/* cursor-following dual-image reveal */}
      <div ref={cursorRef} className={`fm-cursor ${hover != null ? 'is-on' : ''}`} aria-hidden="true">
        {hover != null && (
          <>
            <img src={items[hover].image1} alt="" />
            <img src={items[hover].image2} alt="" />
          </>
        )}
      </div>
    </div>
  );
}
