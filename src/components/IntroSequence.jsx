import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cinematic intro: a solid Golden-Yellow viewport with the logo massive in the
 * centre, then a swift curtain slide-up that reveals the hero canvas beneath.
 * Runs once (after assets are ready) then calls onDone. StrictMode-safe.
 */
export default function IntroSequence({ onDone }) {
  const root = useRef(null);
  const logo = useRef(null);
  // Keep latest onDone without making it an effect dependency (which would
  // restart the intro on every parent re-render, e.g. scroll-spy updates).
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(logo.current, { autoAlpha: 0, scale: 0.85 });
      gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => onDoneRef.current && onDoneRef.current() })
        .to(logo.current, { autoAlpha: 1, scale: 1, duration: 0.7 })
        .to(logo.current, { autoAlpha: 0, scale: 1.06, duration: 0.5 }, '+=0.4')
        // curtain reveal — the whole golden panel slides up off-screen
        .to(root.current, { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '-=0.05');
    }, root);
    return () => ctx.revert();
  }, []); // run exactly once

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-golden-yellow"
    >
      <img
        ref={logo}
        src="/logo-transparent.jpg"
        alt="Lucky 2000"
        className="w-[min(50vw,360px)] rounded-3xl mix-blend-multiply"
      />
    </div>
  );
}
