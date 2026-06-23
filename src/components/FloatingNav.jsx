import { useTranslation } from 'react-i18next';
import './FloatingNav.css';

function InstagramIcon() {
  return (
    <svg className="fnav__ig" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * FloatingNav — two absolute-positioned frosted-glass ovals (NOT a full-width
 * bar, so the hero canvas stays unobstructed).
 *  • Left oval  : logo mark + "Lucky 2000"
 *  • Right oval : About, Location, Instagram icon, EN/ع toggle
 * Sides mirror automatically under RTL (flex order follows dir).
 */
export default function FloatingNav({ items = [], activeHref, instaHref }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const toggleLang = () => i18n.changeLanguage(isArabic ? 'en' : 'ar');

  // Split links from the Instagram entry (rendered as an icon).
  const linkItems = items.filter((i) => !i.href.startsWith('http'));
  const ig = instaHref || items.find((i) => i.href.startsWith('http'))?.href || '#';

  return (
    <header className="fnav" role="banner">
      {/* LEFT — brand oval (logo image + wordmark; floats, always visible) */}
      <a className="fnav__oval fnav__brand" href="#top" aria-label="Lucky 2000 home">
        <img src="/logo-transparent.jpg" alt="" className="fnav__logo-img" aria-hidden="true" />
        <span className="fnav__logo-text">Lucky&nbsp;2000</span>
      </a>

      {/* RIGHT — nav oval */}
      <nav className="fnav__oval fnav__menu" aria-label="Primary">
        {linkItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`fnav__link ${activeHref === item.href ? 'is-active' : ''}`}
          >
            {item.label}
          </a>
        ))}

        <a
          className="fnav__iconlink"
          href={ig}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </a>

        <button
          type="button"
          className="fnav__lang"
          onClick={toggleLang}
          aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <span className={!isArabic ? 'is-on' : ''}>EN</span>
          <span className="fnav__lang-sep">/</span>
          <span className={isArabic ? 'is-on' : ''}>ع</span>
        </button>
      </nav>
    </header>
  );
}
