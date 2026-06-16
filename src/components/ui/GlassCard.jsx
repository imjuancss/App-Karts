import { cn } from '../../lib/utils';

/**
 * GlassCard Component
 * Reusable card wrapper implementing the glassmorphism and solid surfaces
 * from the Velocity Noir design system.
 * 
 * Props:
 * - variant: 'glass' | 'low' | 'high' | 'highest' | 'primary-border'
 * - padding: string (e.g., 'p-6', 'p-4', 'p-8')
 */
export default function GlassCard({
  children,
  variant = 'low',
  padding = 'p-6',
  stacked = true,
  className = '',
  ...props
}) {
  let baseClasses = `${padding} relative overflow-hidden rounded-sm `;
  if (stacked) {
    baseClasses += 'flex flex-col gap-4 ';
  }

  switch (variant) {
    case 'glass':
      baseClasses += 'bg-[rgba(26,30,36,0.6)] backdrop-blur-xl border-none shadow-[0_0_40px_rgba(255,255,255,0.05)] ';
      break;
    case 'low':
      baseClasses += 'bg-surface-container-low ';
      break;
    case 'high':
      baseClasses += 'bg-surface-container-high border border-surface-container-highest ';
      break;
    case 'highest':
      baseClasses += 'bg-surface-container-highest ';
      break;
    case 'primary-border':
      baseClasses += 'bg-surface-container-highest border-l-4 border-primary-dim ';
      break;
  }

  return (
    <div className={cn(baseClasses, className)} {...props}>
      {children}
    </div>
  );
}
