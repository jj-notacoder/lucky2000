/**
 * Massive section heading with a squiggly underline (SVG wave sized to the word).
 * Wrap text colour via className (e.g. "text-cream"); centre via "text-center".
 */
export default function SectionTitle({ children, className = '' }) {
  return (
    <div className={className}>
      <div className="inline-block">
        <h2 className="m-0 font-display font-extrabold leading-[0.92] text-lucky-red text-[clamp(48px,9vw,120px)] [text-shadow:0_2px_18px_rgba(250,243,224,0.55)]">
          {children}
        </h2>
        <svg className="mt-1 block h-[0.5em] w-full" viewBox="0 0 360 18" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M2 10 Q 22 -2 42 10 T 82 10 T 122 10 T 162 10 T 202 10 T 242 10 T 282 10 T 322 10 T 358 10"
            fill="none" stroke="var(--golden-yellow)" strokeWidth="4" strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
