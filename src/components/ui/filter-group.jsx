import * as React from "react"
import { cn } from "../../lib/utils"

const FilterGroupContext = React.createContext()

const FilterGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <FilterGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        className={cn("flex items-center gap-2 overflow-x-auto scrollbar-hide", className)}
        {...props}
      >
        {children}
      </div>
    </FilterGroupContext.Provider>
  )
})
FilterGroup.displayName = "FilterGroup"

const FilterItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(FilterGroupContext)
  if (!context) {
    throw new Error("FilterItem must be used within a FilterGroup")
  }
  
  const isSelected = context.value === value

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-xs font-headline font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-white/30 text-white"
          : "bg-transparent text-on-surface-variant hover:bg-white/10 hover:text-on-surface",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
FilterItem.displayName = "FilterItem"

export { FilterGroup, FilterItem }
