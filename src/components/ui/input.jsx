import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full px-4 py-4 bg-black/20 border-none rounded-sm text-on-surface text-[0.95rem] transition-all focus-visible:border-primary-dim focus-visible:bg-black/30 focus-visible:ring-0 shadow-none placeholder:text-on-surface-variant/50 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props} />
  );
}

export { Input }
