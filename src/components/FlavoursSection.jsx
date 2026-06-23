import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionTitle from './SectionTitle';
import BorderGlow from './BorderGlow';
import './FlavoursSection.css';

const IG = 'https://www.instagram.com/luckytwothousand/';
const GLOW = ['#ef2e31', '#fde67e', '#b6e8de'];

export default function FlavoursSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(0);

  const cards = [
    { key: 'cinnamon', name: t('flavours.items.cinnamon'), img: '/extendcards/1.webp' },
    { key: 'orange', name: t('flavours.items.orange'), img: '/extendcards/2.webp' },
    { key: 'chocolate', name: t('flavours.items.chocolate'), img: '/extendcards/3.webp' },
    { key: 'strawberry', name: t('flavours.items.strawberry'), img: '/extendcards/4.webp' },
    { key: 'mystery', name: t('flavours.mystery'), img: '/extendcards/5.webp', mystery: true },
  ];

  return (
    <section id="flavours" className="flavours-sec">
      <SectionTitle className="text-center mb-[clamp(28px,5vh,56px)]">{t('flavours.title')}</SectionTitle>

      <div className="flav-row">
        {cards.map((c, i) => (
          <BorderGlow
            key={c.key}
            colors={GLOW}
            borderRadius={20}
            glowRadius={40}
            glowIntensity={1}
            backgroundColor="#120F17"
            className={`flav-card ${open === i ? 'is-open' : ''} ${c.mystery ? 'is-mystery' : ''}`}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            tabIndex={0}
            role={c.mystery ? 'link' : 'button'}
            onClick={() => (c.mystery ? window.open(IG, '_blank', 'noopener') : setOpen(i))}
          >
            <div className="flav-card__bg" style={{ backgroundImage: `url(${c.img})` }} />
            <div className="flav-card__shade" />
            <div className="flav-card__label">
              <h3>{c.name}</h3>
              {c.mystery && (
                <p className="flav-card__cta">
                  {t('flavours.mysteryCta')} <span>↗ IG</span>
                </p>
              )}
            </div>
          </BorderGlow>
        ))}
      </div>
    </section>
  );
}
