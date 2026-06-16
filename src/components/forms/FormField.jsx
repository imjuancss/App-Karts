import { cn } from '../../lib/utils';

export default function FormField({ label, htmlFor, children, className, hint }) {
  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-on-surface-variant font-label uppercase text-xs tracking-wider"
        >
          {label}
        </label>
      )}
      {children}
      {hint && (
        <p className="text-on-surface-variant/60 font-body text-xs">{hint}</p>
      )}
    </div>
  );
}
