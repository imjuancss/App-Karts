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
- Mobile-first responsive: All UI must be designed for 1 column/375px first, then scale up using sm/md/lg breakpoints.
  - Layout & Spacing Architecture (Shadcn-inspired):
    - Page Master Container: Every page MUST have a single master container wrapping its content (e.g., `<main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10 md:gap-16">`) to enforce consistent spacing and boundaries. Do not leave elements "flying" outside of containers.
    - Content Group Containers: Every logical group of content must be wrapped in its own container (`GlassCard`, `div.bg-surface-container`, etc.) that strictly specifies its internal padding (e.g., `p-6` or `p-8`) and its internal spacing (`flex flex-col gap-6`).
    - Component Bounds & Responsive: Limit reading widths to `max-w-prose` or `max-w-3xl`. Forms and inputs must be constrained to `max-w-md` or `max-w-2xl` to prevent stretching on desktop. Card layouts must use fluid grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
    - Container boundaries: Use `w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8` to prevent full-bleed stretching on wide screens while maintaining breathing room.
    - Vertical rhythm: Use `flex flex-col gap-10 md:gap-16` (or `space-y-10 md:space-y-16`) for page-level structural blocks (header to main, section to section) and `gap-6 md:gap-8` for smaller logical blocks. Avoid random top/bottom margins.
    - Explicit Structural Grouping (No Floating Elements): All logical groups of elements (like content inside Tabs, or adjacent sections) MUST be explicitly wrapped in a Flexbox container (`flex flex-col gap-X`). Never rely on arbitrary margins (like `mt-8`, `mb-8`, `space-y-*`) to separate blocks or components. Every block of content MUST live inside a declared flex layout container.
    - Component Padding: Base padding should be dense for mobile (`p-4`), scaling to `md:p-6 lg:p-8` for larger cards to give elements space to breathe. Avoid exaggerated padding on small inner cards (e.g., stick to `p-6` instead of `p-6 md:p-8` for inner list items).
  - Element & Content Spacing: Never let titles, descriptions, and metadata rows touch with 0 padding or narrow margins (e.g. `mb-1`, `mb-2`). Titles (such as `h1`, `h2`, `h3`, `h4`) and description paragraphs or labels must be separated by at least `mb-4` or grouped in a parent container with `flex flex-col gap-3` to guarantee breathing room.
- Spacing scale: Use Tailwind's spacing scale (4, 6, 8, 12, 16). Never use arbitrary values like p-[13px].
- Dark mode is the default. All components must work on
  dark backgrounds
- Animations: use transition-all duration-200 for micro-
  interactions. No spring physics or complex keyframes
  unless specifically requested
