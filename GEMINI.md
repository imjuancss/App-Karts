## UI / Design Rules — KartSocial "Velocity Noir"
- Always read **DESIGN.md** before generating any UI code.
- Use Tailwind CSS utility classes exclusively. No inline styles. No custom CSS files unless absolutely necessary.
- Use shadcn/ui components as the base for all UI elements.
  Check if a shadcn component exists before building custom.
  Componentes personalizados permitidos: `input.jsx`, `textarea.jsx`, `select-native.jsx`, `button.jsx`, `Badge.jsx`, `GlassCard.jsx`, `HeroHeader.jsx`, `tabs.jsx`, `filter-group.jsx`
- **Layout primitives** (prefer over raw class strings): `PageContainer`, `PageHeader`, `ContentSection`, `FormSection` in `src/components/layout/`
- Tabs: usar siempre `tabs.jsx` (pill style, sin `border-b`)
- Filters: usar `filter-group.jsx` en lugar de botones sueltos
- All colors from DESIGN.md palette — never arbitrary hex or Tailwind default palette.
  - Primary Accent: `#FF3100` (Ignition Red) for primary buttons, alerts, and critical actions.
  - Performance Accent: `#CAFD00` (Electric Lime) for fastest laps, split times, and live status.
  - Monospace Data Font: Use `font-mono` (Geist Mono) for all times, numerical rankings, lap offsets, and telemetry fields.
- Every interactive element: hover, focus-visible ring, disabled state, cursor.
- Mobile-first: 1 column @ 375px, then `sm` / `md` / `lg`.
- **Toast notifications** use `useToast()` from `src/components/ui/toast.jsx` — never use `alert()`.
- **Formatters** (formatMsToTime, formatTimeInput, parseTimeToMs, formatGap) live in `src/lib/formatters.js` — import from there, never duplicate.
- **Auth**: Protected routes use `<ProtectedRoute>` from `src/components/auth/ProtectedRoute.jsx`.

### Spacing (enforced — see DESIGN.md Spacing Scale)
- **Page:** `PageContainer` → `gap-6 md:gap-8`
- **Section:** `ContentSection` → `gap-4 md:gap-6`
- **Header block:** `PageHeader` → `gap-3` between title and description
- **Form:** `FormSection` → `gap-4`, `max-w-2xl`
- **Padding:** `p-6` default on cards; `p-4` compact; `p-8` only on large outer sections
- **Forbidden:** `space-y-*`, `mt-8`/`mb-8` between siblings, `mb-1`/`mb-2` between title and description, arbitrary values like `p-[13px]`.
- **Allowed scale only:** 4, 6, 8, 12, 16 (Tailwind spacing).

### Bounds & Layout
- Reading width: `max-w-prose`, `max-w-3xl`, or `max-w-5xl`
- Forms: `max-w-md` or `max-w-2xl`
- Card grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Premium Effects (CSS utility classes in index.css)
- `.glass-panel` — Premium glassmorphism (blur 20px, gradient, inset highlight)
- `.gradient-border` — Gradient border effect (red→lime, masked)
- `.speed-line` — Asymmetric left border (red→lime gradient)
- `.noise-overlay` — Subtle noise texture
- `.scanline-overlay` — Telemetry scanline effect
- `.kinetic-gradient` — 45deg red gradient
- `.active-glow` — Red glow shadow
- `.fade-in` — Premium spring-based fade-in animation
- `.slide-up` — Slide-up entrance animation

### Elevation System (CSS variables in :root)
- `--shadow-elevation-1` — Subtle shadow
- `--shadow-elevation-2` — Medium shadow
- `--shadow-elevation-3` — Deep shadow
- `--shadow-glow-primary` — Red glow
- `--shadow-glow-lime` — Lime glow
- `--transition-smooth` — Spring-based transition

### Other
- Dark mode is default.
- Animations: `transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)` for premium feel.
