import React from 'react';

/**
 * KineticCard
 * Reusable Velocity Noir card component built exclusively with Tailwind CSS.
 * 
 * Props:
 * - image: string (optional URL for card image)
 * - imageAlt: string (optional description of image)
 * - badge: ReactNode (optional badge placed over image or top of card)
 * - title: ReactNode/string (optional card title)
 * - subtitle: ReactNode/string (optional card subtitle)
 * - metadata: ReactNode (optional metadata row displayed at the top of content)
 * - description: string (optional body text with line-clamp)
 * - footer: ReactNode (optional footer section separated by a top border)
 * - onClick: function (optional click handler, turns on cursor-pointer)
 * - className: string (optional additional Tailwind classes for outer container)
 */
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
  // Detect if className already specifies a custom height or min/max height
  const hasHeightClass = className.split(' ').some(c => 
    c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-')
  );
  const heightClass = hasHeightClass ? '' : 'h-auto';

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container rounded-sm flex flex-col ${heightClass} overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:bg-surface-container-highest ${
        onClick ? 'cursor-pointer select-none' : ''
      } ${className}`}
      {...props}
    >
      {/* Card Image Area */}
      {image && (
        <div className="relative w-full h-48 overflow-hidden shrink-0">
          <img
            src={image}
            alt={imageAlt || (typeof title === 'string' ? title : 'Card cover')}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop';
            }}
          />
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              {badge}
            </div>
          )}
        </div>
      )}

      {/* Card Body content */}
      <div className="p-5 flex flex-col gap-3 flex-grow">
        {/* If no image but badge exists, render it here */}
        {!image && badge && (
          <div className="flex justify-between items-center mb-1">
            {badge}
          </div>
        )}

        {/* Metadata row */}
        {metadata && (
          <div className="flex justify-between items-center text-xs text-on-surface-variant/70">
            {metadata}
          </div>
        )}

        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <div className="flex flex-col gap-1.5">
            {title && (
              <h4 className="text-xl font-bold text-on-surface leading-tight font-headline">
                {title}
              </h4>
            )}
            {subtitle && (
              <div className="text-xs text-on-surface-variant/70">
                {subtitle}
              </div>
            )}
          </div>
        )}

        {/* Description paragraph */}
        {description && (
          <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Custom children */}
        {children}

        {/* Footer Area */}
        {footer && (
          <div className="mt-auto pt-4 border-t border-surface-container-high flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
