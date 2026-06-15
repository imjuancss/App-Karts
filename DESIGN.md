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
*   **Body & Labels (Inter):** This is our "Telemetry." High legibility for dense data. Use `body-md` (0.875rem) for driver stats and `label-sm` (0.6875rem) for micro-metrics like "+0.025s" splits.
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

### 5.3 Page Master Containers & Responsive Bounds
## Layout Architecture

**Master Containers:**
Every page MUST have a single master container wrapping its content.
- Example: `<main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10 md:gap-16">`

**Content Group Containers & Explicit Structural Grouping:**
- Every logical group of content MUST be explicitly wrapped in a Flexbox container (`flex flex-col gap-X`).
- Never leave elements "floating" without a container, especially inside Tabs, Dialogs, or below Navigation components.
- Never rely on arbitrary margins (like `mt-8`, `mb-8`, `space-y-*`) to separate unrelated adjacent blocks. Use the flex gap of the parent.
- Example for groups: `className="bg-surface-container-low p-6 flex flex-col gap-6"`

**Component Padding:**
- Use padding strictly for inner breathing room (`p-4` on mobile, `p-6` as standard default, up to `md:p-8` for large sections).
- Do not use exaggerated padding (`p-6 md:p-8` or `p-8 md:p-12`) on small component-level cards or list items. Stick to the design system default `p-6`. (`gap-6`).
- **Responsive Bounds:**
  - *Forms:* Limitar el ancho horizontal de formularios e inputs usando `max-w-md` o `max-w-2xl` según complejidad. No permitir inputs de 1200px de ancho en Desktop.
  - *Reading Text & Details:* Limitar los bloques de texto o detalles de lectura a anchos confortables (`max-w-3xl` o `max-w-5xl`).
  - *Grids:* Usar grillas responsivas para tarjetas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

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

Just as a racetrack needs runoff areas to prevent crashes, an interface needs spatial rhythm (padding and gaps) to prevent elements from feeling cramped or "pegged" together. We follow Shadcn's approach to spatial distribution:

*   **Mobile-First Strictness**: The UI starts at a dense 1-column layout for 375px screens. No assumptions are made about desktop width until explicit breakpoints (`md:`, `lg:`) are used.
*   **Grid Fluidity**: Always start with `grid-cols-1`. Expand to `md:grid-cols-2` or `lg:grid-cols-3` as the viewport scales.
*   **The Container Boundary**: Use `w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8` as the standard wrapper for content. This prevents the UI from bleeding infinitely on ultrawide monitors, ensuring a focused, readable track.
*   **Vertical Rhythm (The Racing Line)**: Do not use random `mt-` or `mb-` margins inside lists or sections. Let the parent container dictate the rhythm. Page-level wrappers must use `flex flex-col gap-10 md:gap-16` (or `space-y-10 md:space-y-16`) to separate main layout blocks (header, content sections, footer), while smaller component groups or list items use `gap-6 md:gap-8` to ensure breathing room without visual clutter.
*   **Breathing Room (Component Padding)**: Internal padding for cards or surface blocks must scale. Start with `p-4` for mobile, and scale to `md:p-6 lg:p-8`. A cramped component feels cheap; a spacious component feels engineered.
*   **Title & Description Spacing (The Clearance Zone)**: To prevent text items from colliding or sticking together, do not use `mb-2` or zero spacing between titles and descriptions. Always separate titles (like `h1`, `h2`, `h3`, `h4`) from their subheadings or descriptive paragraphs by a minimum of `mb-4` (or `mb-3` in high-density components) or place them in a `flex flex-col gap-3` (12px) container.
*   **Card Content Spacing**: Any content inside a card (`GlassCard`, `KineticCard`, etc.) must have structured vertical separation. Never let text blocks or other components sit immediately adjacent with zero margins. Use standard Tailwind spacing values (`gap-3` or `gap-4`) to ensure a readable and clean visual rhythm.
