## UI / Design Rules
- Always read **DESIGN.md** (especially §5.3 and §7) before generating any UI code
- Use Tailwind CSS utility classes exclusively. No inline styles. No custom CSS files unless absolutely necessary
- Use shadcn/ui components as the base for all UI elements.
  Check if a shadcn component exists before building custom.
  Componentes personalizados permitidos: `input.jsx`, `textarea.jsx`, `select-native.jsx`, `button.jsx`, `Badge.jsx`, `GlassCard.jsx`, `HeroHeader.jsx`, `tabs.jsx`, `filter-group.jsx`
- **Layout primitives** (prefer over raw class strings): `PageContainer`, `PageHeader`, `ContentSection`, `FormSection` in `src/components/layout/`
- Tabs: usar siempre `tabs.jsx` (pill style, sin `border-b`)
- Filters: usar `filter-group.jsx` en lugar de botones sueltos
- All colors from DESIGN.md palette — never arbitrary hex or Tailwind default palette
- Every interactive element: hover, focus-visible ring, disabled state, cursor
- Mobile-first: 1 column @ 375px, then `sm` / `md` / `lg`

### Spacing (enforced — see DESIGN.md §7)
- **Page:** `PageContainer` → `gap-6 md:gap-8`
- **Section:** `ContentSection` → `gap-4 md:gap-6`
- **Header block:** `PageHeader` → `gap-3` between title and description
- **Form:** `FormSection` → `gap-4`, `max-w-2xl`
- **Padding:** `p-6` default on cards; `p-4` compact; `p-8` only on large outer sections
- **Forbidden:** `space-y-*`, `mt-8`/`mb-8` between siblings, `mb-1`/`mb-2` between title and description, arbitrary values like `p-[13px]`
- **Allowed scale only:** 4, 6, 8, 12, 16 (Tailwind spacing)

### Bounds
- Reading width: `max-w-prose`, `max-w-3xl`, or `max-w-5xl`
- Forms: `max-w-md` or `max-w-2xl`
- Card grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Other
- Dark mode is default
- Animations: `transition-all duration-200` for micro-interactions unless requested otherwise
