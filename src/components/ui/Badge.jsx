import React from 'react';

/**
 * Badge Component
 * A customizable status badge using Velocity Noir styling.
 * 
 * Props:
 * - variant: 'default' | 'open' | 'closed' | 'ongoing' | 'success' | 'warning'
 * - pulse: boolean (adds a pulsing dot indicator)
 * - icon: string (Material Symbols icon name)
 */
export default function Badge({ children, variant = 'default', pulse = false, icon, className = '', ...props }) {
  let baseClasses = 'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm select-none ';
  let textClasses = 'font-headline text-[10px] font-bold uppercase tracking-widest leading-none ';

  switch (variant) {
    case 'open':
    case 'error':
      baseClasses += 'bg-error-container text-black ';
      break;
    case 'closed':
    case 'default':
      baseClasses += 'bg-surface-container-highest text-on-surface-variant ';
      break;
    case 'ongoing':
    case 'primary':
      baseClasses += 'bg-tertiary-fixed text-black ';
      break;
    case 'success':
      baseClasses += 'bg-tertiary-fixed/20 text-tertiary-fixed ';
      break;
    case 'warning':
      baseClasses += 'bg-primary-dim/20 text-primary-dim ';
      break;
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${variant === 'open' || variant === 'error' ? 'bg-error' : variant === 'ongoing' ? 'bg-black' : 'bg-current'}`}></span>
      )}
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
      )}
      <span className={textClasses}>{children}</span>
    </div>
  );
}
