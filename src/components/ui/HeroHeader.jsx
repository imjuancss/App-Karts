import React, { useEffect } from 'react';
import Badge from './Badge';

/**
 * HeroHeader Component
 * Large image header with parallax effect, gradient overlay, and title layout.
 * 
 * Props:
 * - title: string
 * - subtitle: string
 * - imageUrl: string
 * - badgeText: string
 * - badgeVariant: string
 * - children: ReactNode (for the right side card)
 */
export default function HeroHeader({ 
  title, 
  subtitle, 
  imageUrl, 
  badgeText, 
  badgeVariant = 'open', 
  children,
  className = ''
}) {
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroImage = document.querySelector('.hero-parallax-img');
      if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 ${className}`}>
      <div className="lg:col-span-8 relative overflow-hidden aspect-[21/9] rounded-sm group">
        {imageUrl ? (
          <img 
            className="hero-parallax-img w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" 
            src={imageUrl}
            alt={title}
          />
        ) : (
          <div className="hero-parallax-img w-full h-full bg-surface-container-highest"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div className="flex flex-col gap-3">
            {badgeText && (
              <Badge 
                variant={badgeVariant} 
                pulse={badgeVariant === 'open' || badgeVariant === 'error'} 
              >
                {badgeText}
              </Badge>
            )}
            <h2 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">{title}</h2>
            {subtitle && (
              <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side content (usually a GlassCard) */}
      {children && (
        <div className="lg:col-span-4 flex flex-col gap-4">
          {children}
        </div>
      )}
    </section>
  );
}
