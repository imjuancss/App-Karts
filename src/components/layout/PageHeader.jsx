import { cn } from '../../lib/utils';

/**
 * Page title block — title + description with gap-3 clearance zone
 * @param {'column' | 'row'} layout - column (default) or row on md+
 */
export default function PageHeader({
  title,
  description,
  icon,
  actions,
  layout = 'column',
  className,
  titleClassName,
  descriptionClassName,
}) {
  return (
    <header
      className={cn(
        'flex gap-6 items-center text-center md:items-start md:text-left w-full',
        layout === 'row'
          ? 'flex-col md:flex-row md:items-end md:justify-between'
          : 'flex-col',
        className
      )}
    >
      <div className="flex flex-col gap-3 max-w-2xl items-center md:items-start w-full">
        {title && (
          <h1
            className={cn(
              'text-3xl md:text-4xl font-bold text-on-surface font-headline flex items-center justify-center md:justify-start gap-3 w-full',
              titleClassName
            )}
          >
            {icon}
            {title}
          </h1>
        )}
        {description && (
          <p
            className={cn(
              'font-body text-on-surface-variant text-base tracking-wide',
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
