export default function KineticCard({
  children,
  image,
  imageAlt,
  badge,
  title,
  subtitle,
  metadata,
  description,
  footer,
  onClick,
  className = '',
  ...props
}) {
  const hasHeightClass = className.split(' ').some(c =>
    c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-')
  );
  const heightClass = hasHeightClass ? '' : 'h-auto';

  return (
    <div onClick={onClick}
      className={`bg-surface-container rounded-sm flex flex-col ${heightClass} overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-surface-container-highest hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-transparent hover:border-white/[0.06] ${
        onClick ? 'cursor-pointer select-none' : ''
      } ${className}`}>
      {image && (
        <div className="relative w-full h-48 overflow-hidden shrink-0">
          <img src={image} alt={imageAlt || title || ''} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-60"></div>
          {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-grow">
        {metadata && (
          <div className="text-xs text-on-surface-variant/70 font-label uppercase tracking-wider">{metadata}</div>
        )}
        {title && (
          <h3 className="text-xl font-bold text-on-surface font-headline leading-tight">{title}</h3>
        )}
        {subtitle && (
          <div className="text-xs text-on-surface-variant/70">{subtitle}</div>
        )}
        {description && (
          <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed">{description}</p>
        )}
        {footer && (
          <div className="mt-auto pt-4 border-t border-white/[0.04]">{footer}</div>
        )}
        {!footer && children}
        {!footer && !children && <div className="mt-auto"></div>}
      </div>
    </div>
  );
}
