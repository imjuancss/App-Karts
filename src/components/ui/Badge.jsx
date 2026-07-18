export default function Badge({ children, variant = 'default', pulse = false, icon, className = '', ...props }) {
  let baseClasses = 'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm select-none transition-all duration-300 ';
  let textClasses = 'font-headline text-[10px] font-bold uppercase tracking-widest leading-none ';

  switch (variant) {
    case 'open':
    case 'error':
      baseClasses += 'bg-error-container text-black shadow-[0_0_10px_rgba(255,110,132,0.15)] ';
      break;
    case 'closed':
    case 'default':
      baseClasses += 'bg-surface-container-highest text-on-surface-variant ';
      break;
    case 'ongoing':
    case 'primary':
      baseClasses += 'bg-tertiary-fixed text-black shadow-[0_0_10px_rgba(202,253,0,0.15)] ';
      break;
    case 'success':
      baseClasses += 'bg-tertiary-fixed/20 text-tertiary-fixed shadow-[0_0_8px_rgba(202,253,0,0.1)] ';
      break;
    case 'warning':
      baseClasses += 'bg-primary-dim/20 text-primary-dim shadow-[0_0_8px_rgba(225,42,0,0.1)] ';
      break;
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          variant === 'open' || variant === 'error' ? 'bg-error' :
          variant === 'ongoing' ? 'bg-black' : 'bg-current'
        }`}></span>
      )}
      {icon && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>}
      <span className={textClasses}>{children}</span>
    </div>
  );
}
