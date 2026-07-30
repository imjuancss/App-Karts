import { cn } from '../../lib/utils';

export default function GlassCard({
  children,
  variant = 'low',
  padding = 'p-6',
  stacked = true,
  className = '',
  ...props
}) {
  let baseClasses = `${padding} relative overflow-hidden rounded-sm transition-all duration-300 `;
  if (stacked) {
    baseClasses += 'flex flex-col gap-4 ';
  }

  switch (variant) {
    case 'glass':
      baseClasses += 'bg-gradient-to-br from-[rgba(26,30,36,0.7)] to-[rgba(18,18,18,0.5)] backdrop-blur-2xl border border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.1] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] ';
      break;
    case 'low':
      baseClasses += 'bg-surface-container-low hover:bg-surface-container-high shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)] ';
      break;
    case 'high':
      baseClasses += 'bg-surface-container-high border border-surface-container-highest hover:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)] ';
      break;
    case 'highest':
      baseClasses += 'bg-surface-container-highest shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)] ';
      break;
    case 'primary-border':
      baseClasses += 'bg-surface-container-highest shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)] ';
      break;
  }

  return (
    <div className={cn(baseClasses, className)} {...props}>
      {variant === 'primary-border' && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#FF3100] to-[#CAFD00] rounded-r-sm"></div>
      )}
      {children}
    </div>
  );
}
