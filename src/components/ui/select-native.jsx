import * as React from "react"

import { cn } from "@/lib/utils"

const SelectNative = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex w-full px-4 py-4 bg-black/20 border-none rounded-sm text-on-surface text-[0.95rem] transition-all focus-visible:border-primary-dim focus-visible:bg-black/30 focus-visible:ring-0 shadow-none placeholder:text-on-surface-variant/50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
SelectNative.displayName = "SelectNative"

export { SelectNative }
