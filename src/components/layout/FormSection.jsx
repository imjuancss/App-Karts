import { cn } from '../../lib/utils';

/**
 * Form wrapper with constrained width and field spacing
 */
export default function FormSection({
  children,
  className,
  as,
  maxWidth = '2xl',
  ...props
}) {
  const Tag = as || 'div';
  const maxWidthClass = {
    md: 'max-w-md',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full',
  }[maxWidth] ?? 'max-w-2xl';

  return (
    <Tag
      className={cn('w-full flex flex-col gap-4', maxWidthClass, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
