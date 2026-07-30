import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full px-4 py-4 bg-white/[0.03] border border-white/[0.04] rounded-sm text-on-surface text-[0.95rem] transition-all duration-300 focus-visible:border-primary-dim focus-visible:bg-white/[0.05] focus-visible:shadow-[0_0_0_2px_rgba(255,49,0,0.12),0_0_20px_rgba(255,49,0,0.04)] placeholder:text-on-surface-variant/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/[0.08] hover:bg-white/[0.04]",
        className
      )}
      {...props} />
  );
}

export { Input }
