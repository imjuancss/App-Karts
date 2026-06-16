import { cn } from '../../lib/utils';

/**
 * Master page wrapper — DESIGN.md §5.3 / §7
 * @param {boolean} bleed - Skip horizontal max-width constraint (rare; prefer ContentSection inside)
 * @param {boolean} compact - Skip default top/bottom page padding
 */
export default function PageContainer({
  children,
  className,
  as,
  bleed = false,
  compact = false,
  ...props
}) {
  const Tag = as || 'main';
  return (
    <Tag
      className={cn(
        'w-full flex flex-col gap-6 md:gap-8 font-body',
        !bleed && 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8',
        !compact && 'pt-8 md:pt-12 pb-20',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
