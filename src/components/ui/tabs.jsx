import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext(null)

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [tab, setTab] = React.useState(value !== undefined ? value : defaultValue)

  React.useEffect(() => {
    if (value !== undefined) {
      setTab(value)
    }
  }, [value])

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setTab(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ value: tab, onValueChange: handleTabChange }}>
      <div className={cn("w-full flex flex-col gap-4", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }) {
  return (
    <div className={cn("p-1 bg-surface-container inline-flex justify-start items-center gap-2 rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const isActive = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "flex-1 md:flex-none h-8 px-4 flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-300 rounded-sm text-xs md:text-sm font-normal font-sans tracking-widest uppercase",
        isActive 
          ? "bg-white/[0.1] text-white shadow-[0_0_12px_rgba(255,255,255,0.04)]" 
          : "text-white/60 hover:bg-white/[0.04] hover:text-white/80",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null

  return (
    <div className={cn("outline-none fade-in", className)}>
      {children}
    </div>
  )
}
