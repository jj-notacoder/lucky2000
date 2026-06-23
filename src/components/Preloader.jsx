import './Preloader.css';

/**
 * Full-screen cream loader with a Lucky-Red spinner + % counter.
 * Stays mounted (fading) until `done`, then removed by the parent.
 */
export default function Preloader({ progress, done }) {
  return (
    <div className={`preloader ${done ? 'preloader--hidden' : ''}`} role="status" aria-live="polite">
      <div className="preloader__spinner" />
      <p className="preloader__pct">
        {Math.round(progress * 100)}<span className="preloader__sign">%</span>
      </p>
    </div>
  );
}
