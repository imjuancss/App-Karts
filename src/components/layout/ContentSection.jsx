import { cn } from '../../lib/utils';

/**
 * Logical page section with consistent internal vertical rhythm
 */
export default function ContentSection({
  children,
  className,
  as,
  ...props
}) {
  const Tag = as || 'section';
  return (
    <Tag
      className={cn('flex flex-col gap-4 md:gap-6', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
