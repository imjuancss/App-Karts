# Design System Strategy: Kinetic Precision

## 1. Overview & Creative North Star
**The Creative North Star: "Velocity Noir"**

This design system is not a mere utility; it is a high-octane editorial experience. We are capturing the soul of the racetrack—the heat of the tarmac, the neon blur of the dashboard, and the unforgiving precision of the stopwatch. To move beyond "standard" app layouts, this system leans into **Asymmetric Momentum**. We avoid static, centered grids in favor of layouts that feel like they are moving at 100mph. By utilizing high-contrast typography scales and overlapping "glass" layers, we create a UI that feels engineered, not just designed.

## 2. Colors: The Thermal Palette
The palette is rooted in a deep, nocturnal base to allow the racing red and performance neons to "burn" through the interface.

### Tonal Foundation
*   **Background (`#0e0e0e`):** The absolute void. All interfaces start here.
*   **Surface Containers:** Use `surface_container_low` (`#131313`) for large sections and `surface_container_highest` (`#262626`) for interactive elements.
*   **Primary Kinetic (`#FF3100` / `primary_dim`):** Our signature racing red. Use this sparingly for critical actions and brand moments.
*   **Tertiary Performance (`#cafd00` / `tertiary_fixed`):** A neon electric lime dedicated exclusively to performance metrics, lap times, and "fastest" indicators.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. A card should never have a gray outline; it should be a `surface_container_high` block sitting on a `background` floor. Use tonal transitions to guide the eye, not physical fences.

### The "Glass & Gradient" Rule
To inject "soul" into the machine, use semi-transparent surface colors with `backdrop-blur` (12px–20px) for floating navigation bars or performance overlays. Primary CTAs must use a linear gradient from `primary` to `primary_container` at a 45-degree angle to mimic the sheen of polished carbon fiber.

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance aggressive racing energy with technical legibility.

*   **Display & Headlines (Space Grotesk):** This is our "Engine." It's wide, technical, and authoritative. Use `display-lg` (3.5rem) for lap times and `headline-md` (1.75rem) for category titles. The exaggerated tracking in headers creates a premium, spacious feel.
*   **Body & Labels (Space Grotesk):** Same family as headlines for a cohesive racing UI. Use `body-md` (0.875rem) for driver stats and `label-sm` (0.6875rem) for micro-metrics like "+0.025s" splits. Apply via `font-body` / `font-label` tokens.
*   **Intentional Weight:** Headlines should be Bold or Medium; Body text should remain Regular to create a sharp, intentional contrast.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "soft" for a racing environment. We use architectural layering.

*   **The Layering Principle:** Achieve depth by "stacking" tiers. Place a `surface_container_highest` card on top of a `surface_container_low` track. This creates a "lift" that feels integrated into the hardware.
*   **Ambient Shadows:** When a floating element (like a "Start Race" FAB) is required, use a highly diffused shadow (`blur: 40px`) with the shadow color set to `on_surface` at 5% opacity. It should look like a soft glow, not a smudge.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use `outline_variant` at 15% opacity. Never use 100% opaque lines.
*   **Kinetic Overlap:** Allow images (like a kart or a driver's helmet) to break the container bounds and overlap onto the background. This breaks the "box" feel and adds 3D depth.

## 5. Components: Engineered Primitives

### Buttons
*   **Primary:** Solid `primary` gradient, `round: sm` (0.125rem). The sharp corners feel more aggressive and "pro" than rounded pills.
*   **Secondary:** Glassmorphic. `surface_variant` at 40% opacity with a `backdrop-blur`.

### Performance Chips
*   **Data Chips:** Use `surface_container_highest` with `tertiary` (neon) text for record-breaking stats. 
*   **Status Chips:** Tiny, high-chroma dots (e.g., `error` for "Live" or "Hot Track") paired with `label-sm` text.

### Cards & Leaderboards
*   **Strict Rule:** No dividers. Use `0.75rem` (xl) vertical spacing to separate leaderboard entries. 
*   **The "Winner's Row":** The #1 rank should utilize a subtle `primary` glow or a `surface_bright` background to distinguish it from the pack without using a border.

### Input Fields & Components
*   **Style**: Underline-only or subtle `surface_container_highest` fills. On focus, the bottom border "fuels up" with a `primary` red transition.
*   **Input/Textarea**: Contenedores oscuros (`bg-black/20` o similar), texto claro, `rounded-sm`. Estado focus con ring o borde primario.
*   **Tabs (Navigation)**: Utilizar diseño "Pill-style" basado en un segmented control, ubicado en un `bg-surface-container` con `rounded-sm` padding. Los elementos activos usan `bg-white/10 text-white`, mientras que los inactivos usan `text-white/60`. **Prohibido** usar pestañas con bordes inferiores (`border-b`).

- **Filters/Toggles (FilterGroup Component)**
  - Use `FilterGroup` instead of standalone buttons or border-b for filtering views.
  - Active State: `bg-surface-variant text-primary-dim`.
  - Inactive State: `bg-surface-container-highest text-on-surface-variant`.
  - Roundedness: `rounded-sm`.

### 5.3 Layout Primitives (use these components)

Prefer shared layout components over re-copying class strings:

| Component | Purpose |
|-----------|---------|
| `PageContainer` | Master page wrapper (`max-w-7xl`, horizontal padding, `gap-6 md:gap-8`, standard vertical padding) |
| `PageHeader` | Page title block: icon + title + description in `flex flex-col gap-3` |
| `ContentSection` | Logical page section with `flex flex-col gap-4 md:gap-6` |
| `FormSection` | Form wrapper: `flex flex-col gap-4`, `max-w-2xl` |

**Master rule:** Every page MUST have a single `PageContainer` (or equivalent classes) wrapping its content.

**Content groups:** Every logical group MUST be wrapped in `flex flex-col gap-X`. Never leave siblings "floating" inside Tabs, Dialogs, or below navigation.

**Responsive bounds:**
- *Forms:* `max-w-md` or `max-w-2xl` — never full-width inputs on desktop.
- *Reading text:* `max-w-3xl` or `max-w-5xl`.
- *Grids:* `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with `gap-6 md:gap-8`.

**Exception:** `HomeLeaderboard` uses `max-w-5xl` and a full-viewport layout by design. Document any new exceptions here.

## 6. Do's and Don'ts

### Do
*   **DO** use `tertiary` (Neon Lime) for numbers that indicate speed or success.
*   **DO** lean into asymmetry. Align a driver's name to the left and their lap time to the far right with significant "negative air" between them.
*   **DO** use `roundedness.sm` (0.125rem) for a technical, precision-cut look.

### Don't
*   **DON'T** use standard Material Design "Blue" or "Purple" for any reason.
*   **DON'T** use 1px solid gray borders. It makes the app look like a generic template.
*   **DON'T** use "pills" (999px radius) for everything. Reserved only for the most tactile, floating action buttons.
*   **DON'T** clutter the screen. If a piece of data isn't helping the driver win, hide it in a sub-layer.

## 7. Layout & Spatial Rhythm (The Runoff Area)

Spatial rhythm prevents elements from feeling cramped. **Always prefer parent `gap` over child `margin`.**

### Spacing scale (single source of truth)

| Token | Tailwind | Use for |
|-------|----------|---------|
| Tight | `gap-3` | Title + subtitle within a group (`PageHeader`, card headings) |
| Default | `gap-4` | Form fields, list items, tab panel content |
| Section | `gap-6` | Sections inside a page (mobile), card internal groups |
| Page | `gap-8` | Page-level sections (desktop), main grids |

### Padding scale

| Context | Classes |
|---------|---------|
| Compact cards / mobile | `p-4` |
| Standard cards & surfaces | `p-6` (default) |
| Large forms / hero panels | `p-8` or `md:p-8` only on **outer** sections — never on list rows or small cards |

### Rules

*   **Mobile-first**: Design for 375px single column; scale with `md:` / `lg:`.
*   **Container boundary**: `w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8` via `PageContainer`.
*   **Vertical rhythm**: Page blocks → `gap-6 md:gap-8`. Inner groups → `gap-4 md:gap-6`. **Do not** stack `gap` on the parent AND `mb-*` on children for the same separation.
*   **No `space-y-*` or `mb-*` between sibling blocks** — wrap siblings in `flex flex-col gap-X` instead.
*   **Title clearance**: Group title + description in `flex flex-col gap-3`. Never use `mb-1`, `mb-2`, or `mt-1` between them.
*   **Card content**: `GlassCard` / `KineticCard` children use `flex flex-col gap-4` (enforced via `stacked` prop on `GlassCard`).
*   **Tabs**: Wrap `TabsList` + `TabsContent` in `flex flex-col gap-4`; do not override `TabsContent` spacing to `mt-0` unless replacing with parent gap.
*   **Grids**: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3` with `gap-6 md:gap-8`.
