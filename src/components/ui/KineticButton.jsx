import React from 'react';

/**
 * KineticButton
 * Reusable Tailwind CSS button applying the Velocity Noir design system.
 * Designed to be backward compatible with previous MUI props.
 */
export default function KineticButton({ children, variant = 'contained', color = 'primary', className = '', ...props }) {
  let baseClasses = 'font-headline font-bold uppercase tracking-widest text-sm rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ';
  
  if (variant === 'contained') {
    if (color === 'primary') {
      baseClasses += 'text-on-primary-container active:scale-95 px-6 py-3 border-none ';
    } else if (color === 'secondary') {
      baseClasses += 'bg-transparent text-white border-2 border-white hover:bg-white/10 px-6 py-3 active:scale-95 ';
    } else if (color === 'error') {
      baseClasses += 'bg-error-container text-white hover:bg-error px-6 py-3 active:scale-95 ';
    } else {
      baseClasses += 'bg-surface-container-highest text-on-surface hover:brightness-110 px-6 py-3 active:scale-95 ';
    }
  } else if (variant === 'outlined') {
    baseClasses += 'border-2 border-primary-dim text-primary-dim hover:bg-primary-dim/10 px-6 py-3 active:scale-95 ';
  } else if (variant === 'text') {
    baseClasses += 'text-on-surface-variant hover:text-on-surface px-4 py-2 ';
  }

  return (
    <button className={`relative overflow-hidden group ${baseClasses} ${className}`} {...props}>
      {variant === 'contained' && color === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dim via-primary-fixed to-primary-dim opacity-100 group-hover:animate-pulse"></div>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">
        {children}
      </span>
    </button>
  );
}
