## UI / Design Rules
- Always read DESIGN.md before generating any UI code
- Use Tailwind CSS utility classes exclusively. No inline
  styles. No custom CSS files unless absolutely necessary
- Use shadcn/ui components as the base for all UI elements.
  Check if a shadcn component exists before building custom. 
  Componentes personalizados permitidos: `input.jsx`, `textarea.jsx`, `select-native.jsx`, `button.jsx`, `Badge.jsx`, `GlassCard.jsx`, `HeroHeader.jsx`, `tabs.jsx`, `filter-group.jsx`
- Tabs (Navigation): Utilizar siempre el componente local `tabs.jsx` que implementa el estilo "Pill" (segmented control) sin bordes inferiores.
- Filters: Use the custom `filter-group.jsx` instead of regular buttons for filter groups. It also uses a "Pill-style" background highlight for active state.
- All colors must come from the DESIGN.md palette. Never
  use arbitrary hex values or Tailwind's default palette
- Every interactive element needs: hover state, focus-visible
  ring, disabled state, and appropriate cursor
- Mobile-first responsive: design for 375px, then add
  sm/md/lg breakpoints
- Spacing: use Tailwind's spacing scale (4, 6, 8, 12, 16).
  Never use arbitrary values like p-[13px]
- Dark mode is the default. All components must work on
  dark backgrounds
- Animations: use transition-all duration-200 for micro-
  interactions. No spring physics or complex keyframes
  unless specifically requested
