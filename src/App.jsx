import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePreloadAssets } from './hooks/usePreloadAssets';
import Preloader from './components/Preloader';
import IntroSequence from './components/IntroSequence';
import WarpBackground from './components/WarpBackground';
import FloatingNav from './components/FloatingNav';
import HeroCanvas from './components/HeroCanvas';
import CurvedLoop from './components/CurvedLoop';
import { AboutSection, LocationSection, Footer } from './components/Sections';
import FlavoursSection from './components/FlavoursSection';

const IG = 'https://www.instagram.com/luckytwothousand/';

export default function App() {
  const { t } = useTranslation();
  const { frames, progress, ready } = usePreloadAssets();
  const [introDone, setIntroDone] = useState(false);


  // Scroll-spy → active nav pill.
  const [activeHref, setActiveHref] = useState('#top');
  useEffect(() => {
    const ids = ['about', 'flavours', 'location'];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveHref('#' + e.target.id); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ready]);

  const localizedItems = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.flavours'), href: '#flavours' },
    { label: t('nav.location'), href: '#location' },
    { label: t('nav.insta'), href: IG },
  ];

  return (
    <>
      <Preloader progress={progress} done={ready} />
      {ready && !introDone && <IntroSequence onDone={() => setIntroDone(true)} />}

      {/* Global Warp background (z-index -1, fades in after the marquee) */}
      <WarpBackground />

      <FloatingNav items={localizedItems} activeHref={activeHref} instaHref={IG} />

      <main>
        <HeroCanvas frames={frames} ready={ready} />

        <section className="marquee-section" aria-label={t('marquee.announcement')}>
          <CurvedLoop
            marqueeText={t('marquee.announcement')}
            speed={2}
            curveAmount={0}
            direction="right"
            interactive={true}
            className="marquee-retro-comic"
          />
        </section>

        <AboutSection />
        <FlavoursSection />
        <LocationSection />
      </main>

      <Footer />
    </>
  );
}
