import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PillNav.css';

/**
 * PillNav — fixed split-layout header.
 *  • Logo cluster: far left, ALWAYS visible (floats independently).
 *  • Right cluster: localized links + EN/ع toggle, right-aligned.
 *  • Hero transparency control: the right cluster + frosted shell fade/translate
 *    up while the user scrolls DOWN through the hero, so the 3D canvas is never
 *    obstructed; the logo stays.
 */
export default function PillNav({
  logo,
  logoAlt = 'Lucky 2000 Logo',
  items = [],
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = '#ef2e31',
  pillColor = '#fbccd4',
  hoveredPillTextColor = '#ef2e31',
  pillTextColor = '#ef2e31',
  theme = 'custom-retro',
  initialLoadAnimation = true,
}) {
  const { i18n } = useTranslation();
  const navRef = useRef(null);
  const rightRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  const isArabic = i18n.language === 'ar';
  const toggleLang = () => i18n.changeLanguage(isArabic ? 'en' : 'ar');

  // Expose the prop colors to CSS as custom properties.
  const styleVars = {
    '--pn-base': baseColor,
    '--pn-pill': pillColor,
    '--pn-pill-text': pillTextColor,
    '--pn-pill-text-hover': hoveredPillTextColor,
  };

  /* ---- initial load animation handled via CSS (.is-ready) — see PillNav.css.
         CSS keeps the default state VISIBLE, so a failed/!ready animation can
         never leave the nav stuck hidden. ---- */

  /* ---- contextual hero transparency: hide right cluster on scroll-down ---- */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const heroEnd = window.innerHeight * 5; // matches HeroCanvas pin length
      const goingDown = y > lastY;
      // Hide only while moving down inside the hero region; reveal otherwise.
      if (y > 60 && goingDown && y < heroEnd) setHidden(true);
      else if (!goingDown || y >= heroEnd) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={navRef}
      style={styleVars}
      className={`pillnav ${className} pillnav--${theme} ${hidden ? 'pillnav--hidden' : ''} ${initialLoadAnimation ? 'is-ready' : ''}`}
    >
      {/* LEFT — logo, always visible / floating */}
      <a className="pillnav__logo" href="#top" aria-label={logoAlt} data-animate>
        LUCKY&nbsp;2000
      </a>

      {/* RIGHT — links + language toggle (this cluster hides over the hero) */}
      <nav ref={rightRef} className="pillnav__right" aria-label="Primary">
        <ul className="pillnav__links">
          {items.map((item) => {
            const external = item.href.startsWith('http');
            const active = activeHref && item.href === activeHref;
            return (
              <li key={item.href} data-animate>
                <a
                  href={item.href}
                  className={`pillnav__pill ${active ? 'is-active' : ''}`}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Minimalist EN / ع toggle */}
        <button
          type="button"
          className="pillnav__lang"
          onClick={toggleLang}
          aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          data-animate
        >
          <span className={!isArabic ? 'is-on' : ''}>EN</span>
          <span className="pillnav__lang-sep">/</span>
          <span className={isArabic ? 'is-on' : ''}>ع</span>
        </button>
      </nav>
    </header>
  );
}
