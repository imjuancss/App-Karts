export default function KineticButton({ children, variant = 'contained', color = 'primary', className = '', ...props }) {
  let baseClasses = 'font-headline font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap shrink-0 ';

  if (variant === 'contained') {
    if (color === 'primary') {
      baseClasses += 'text-white active:scale-95 px-6 py-3 border-none relative overflow-hidden group shadow-[0_0_20px_rgba(255,49,0,0.35)] ';
    } else if (color === 'secondary') {
      baseClasses += 'bg-surface-container-highest text-white border border-outline-variant/30 hover:bg-surface-variant hover:border-outline-variant/60 px-6 py-3 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)] ';
    } else if (color === 'error') {
      baseClasses += 'bg-[#FF3100] text-white hover:bg-[#e12a00] px-6 py-3 active:scale-95 shadow-[0_0_20px_rgba(255,49,0,0.4)] ';
    } else {
      baseClasses += 'bg-surface-container-highest text-white hover:bg-surface-variant border border-outline-variant/30 px-6 py-3 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)] ';
    }
  } else if (variant === 'outlined') {
    baseClasses += 'border border-[#FF3100] text-[#FF3100] hover:bg-[#FF3100]/10 px-6 py-3 active:scale-95 hover:shadow-[0_0_20px_rgba(255,49,0,0.2)] ';
  } else if (variant === 'text') {
    baseClasses += 'text-white/80 hover:text-white px-4 py-2 hover:bg-white/[0.06] ';
  }

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {variant === 'contained' && color === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e12a00] via-[#FF3100] to-[#ff5436] opacity-100 group-hover:shadow-[0_0_30px_rgba(255,49,0,0.4)] transition-shadow duration-300"></div>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">
        {children}
      </span>
    </button>
  );
}
