import { useEffect } from 'react';
import Badge from './Badge';

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
        <img className="hero-parallax-img w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" src={imageUrl} alt={title} />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0A0A]/40"></div>
        {/* Scanline effect */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40"></div>
        {/* Content */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
          <div className="flex flex-col gap-3">
            {badgeText && (
              <div className="inline-flex">
                <Badge variant={badgeVariant}>{badgeText}</Badge>
              </div>
            )}
            <h2 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{title}</h2>
            {subtitle && <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children && <div className="lg:col-span-4 flex flex-col gap-4">{children}</div>}
    </section>
  );
}
