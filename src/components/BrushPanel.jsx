import './BrushPanel.css';

/**
 * BrushPanel — wraps content in a paintbrush-stroke silhouette (CSS mask via
 * /brush.svg) over a 70%-opacity dark frosted background, guaranteeing text
 * stays readable on top of the colourful Iridescence shader.
 */
export default function BrushPanel({ children, className = '', ...rest }) {
  return (
    <div className={`brush-panel ${className}`} {...rest}>
      <div className="brush-panel__inner">{children}</div>
    </div>
  );
}
