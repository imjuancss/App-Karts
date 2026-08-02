export default function KineticButton({ children, variant = 'contained', color = 'primary', className = '', ...props }) {
  let baseClasses = 'font-headline font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap shrink-0 ';

  if (variant === 'contained') {
    if (color === 'primary') {
      baseClasses += 'text-on-primary-container active:scale-95 px-6 py-3 border-none relative overflow-hidden group ';
    } else if (color === 'secondary') {
      baseClasses += 'bg-transparent text-white border-2 border-white hover:bg-white/10 px-6 py-3 active:scale-95 hover:border-white/20 ';
    } else if (color === 'error') {
      baseClasses += 'bg-error-container text-white hover:bg-error px-6 py-3 active:scale-95 shadow-[0_0_15px_rgba(167,1,56,0.2)] hover:shadow-[0_0_25px_rgba(167,1,56,0.3)] ';
    } else {
      baseClasses += 'bg-surface-container-highest text-on-surface hover:brightness-110 px-6 py-3 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] ';
    }
  } else if (variant === 'outlined') {
    baseClasses += 'border-2 border-primary-dim text-primary-dim hover:bg-primary-dim/10 px-6 py-3 active:scale-95 hover:shadow-[0_0_20px_rgba(225,42,0,0.15)] ';
  } else if (variant === 'text') {
    baseClasses += 'text-on-surface-variant hover:text-on-surface px-4 py-2 hover:bg-white/[0.04] ';
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
