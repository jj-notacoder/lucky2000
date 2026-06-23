import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BrushPanel from './BrushPanel';
import SectionTitle from './SectionTitle';
import BorderGlow from './BorderGlow';
import './Sections.css';

const GLOW = ['#ef2e31', '#fde67e', '#b6e8de'];

const IG = 'https://www.instagram.com/luckytwothousand/';

/** About — brush-masked text (left) + edge-lit glass video (right), over Warp. */
export function AboutSection() {
  const { t } = useTranslation();
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // ensure muted-autoplay (JSX attr alone is unreliable)
    const play = () => v.play().catch(() => {});
    play();
    v.addEventListener('canplay', play, { once: true });
    return () => v.removeEventListener('canplay', play);
  }, []);

  return (
    <section id="about" className="about">
      <div className="about__grid">
        {/* LEFT — diagonal brush-masked text */}
        <BrushPanel className="about__text">
          <SectionTitle>{t('about.title')}</SectionTitle>
          <p className="about__subtitle">{t('about.subtitle')}</p>
          <p className="about__body">{t('about.body')}</p>
        </BrushPanel>

        {/* RIGHT — video wrapped in interactive BorderGlow */}
        <BorderGlow className="about__video" colors={GLOW} borderRadius={24} glowRadius={48} backgroundColor="rgba(18,14,22,0.35)">
          <video
            ref={videoRef}
            src="/video-441.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Lucky 2000 doughnuts"
          />
        </BorderGlow>
      </div>
    </section>
  );
}

/** Location — filtered retro Google Map + details, over Warp. */
export function LocationSection() {
  const { t } = useTranslation();
  return (
    <section id="location" className="location">
      <SectionTitle className="text-center mb-[clamp(28px,5vh,56px)]">
        {t('location.title')}
      </SectionTitle>

      <div className="location__inner">
        <div className="location__card glass-card">
          <p className="location__area">{t('location.area')}</p>
          <p className="location__body">{t('location.body')}</p>
          <a className="location__ig" href={IG} target="_blank" rel="noopener noreferrer">
            @luckytwothousand ↗
          </a>
        </div>

        <div className="location__map glass-card">
          {/* Keyless embed + CSS retro/monochrome filter (approximates the JSON style) */}
          <iframe
            title="Lucky 2000 location"
            className="retro-map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=24.5239,54.3773&z=14&output=embed"
          />
        </div>
      </div>
    </section>
  );
}

/** Footer — copyright + repeated social link. */
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">LUCKY&nbsp;2000</span>
        <span className="footer__tag">{t('footer.tagline')}</span>
        <a className="footer__link" href={IG} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        <span className="footer__rights">{t('footer.rights')}</span>
      </div>
    </footer>
  );
}
