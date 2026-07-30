# Design System Strategy: Kinetic Precision (Velocity Noir)

## 1. Subject Grounding
- **Subject:** Amateur and professional karting championship leaderboard and telemetry tracking.
- **Audience:** High-competitiveness racers, karting track operators, and speed enthusiasts who demand raw, instant telemetry.
- **Single Job:** To deliver real-time lap-time rankings, performance splits, and tournament stats with zero friction and maximum visual momentum.

---

## 2. Compact Token System

### A. The Thermal Palette (5 Core Colors)
All components and text utilize these exclusive Tailwind theme-mapped hex values.
- **Midnight Tarmac (`#0A0A0A` / `--color-background`):** The pitch-black, light-absorbent base. All interfaces start here.
- **Cold Asphalt (`#121212` / `--color-surface-container-low`):** Sub-level containers and section backgrounds.
- **Carbon Fiber (`#1F1F1F` / `--color-surface-container-highest`):** High-contrast cards and interactive widgets.
- **Ignition Red (`#FF3100` / `--color-primary`):** Kinetic action, warnings, and primary buttons. Use sparingly for high visual impact.
- **Electric Lime (`#CAFD00` / `--color-tertiary-fixed`):** High-chroma performance neon. Reserved exclusively for fastest lap times, records, splits, and active live indicators.

### B. Typography Pairings
- **Display Role:** **Space Grotesk** (Bold, uppercase, letter-spacing tracking-tighter). Used for authoritative headers, section titles, and branding.
- **Body Role:** **Space Grotesk** (Regular/Medium, standard letter-spacing). Used for stats labels, descriptions, and text paragraphs.
- **Telemetry/Data Role:** **Geist Mono** (Monospace, regular/bold). Used for stopwatch times, gap splits, position numbers, and tabular telemetry, ensuring digits align vertically for rapid comparison.

### C. Layout Concept & Asymmetric Momentum
We avoid static grids. Interfaces shift left or right to create speed.
- Headers are left-aligned with exaggerated tracking.
- Driver information is left-heavy, while stopwatch telemetry is shifted far right, leaving wide negative space.

#### ASCII Wireframe: Asymmetric Leaderboard
```
+-----------------------------------------------------------------+
| [Flag Icon]  KARTSOCIAL                              [Profile]  |
|                                                                 |
|  >> LIVE LEADERBOARD / CIRCUIT: TOCANCIPÁ                       |
|                                                                 |
|  +--[Winner's Glow]------------------------------------------+  |
|  | #1  SEBASTIAN VETTEL                              52.124s |  |
|  |     [Electric Lime Badge: Fastest Lap]            Leader  |  |
|  +-----------------------------------------------------------+  |
|                                                                 |
|  +-----------------------------------------------------------+  |
|  | #2  LEWIS HAMILTON                                52.420s |  |
|  |     Split Offset                                  +0.296s |  |
|  +-----------------------------------------------------------+  |
|                                                                 |
|  +-----------------------------------------------------------+  |
|  | #3  MAX VERSTAPPEN                                52.910s |  |
|  |     Split Offset                                  +0.786s |  |
|  +-----------------------------------------------------------+  |
+-----------------------------------------------------------------+
```

### D. Signature Element
- **The "Asymmetric Speed Line":** Active states, leader rows, or primary container blocks feature an off-grid, sharp left-border indicator. This line uses a 45-degree gradient from **Ignition Red** (`#FF3100`) to **Electric Lime** (`#CAFD00`), breaking container bounds to act as a visual tachometer guiding the user's eye down the performance data.

---

## 3. Strict Design Rules

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. A card should never have a gray outline; it should be a `surface_container_highest` block sitting on a `background` floor. Use tonal transitions to guide the eye.

### The "Glass & Gradient" Rule
To inject depth into the system, use semi-transparent surface colors with `backdrop-blur` (12px–20px) for floating navigation bars or overlays. Primary call-to-actions must use a linear gradient from `primary` to `#e12a00` at a 45-degree angle to mimic the sheen of polished carbon fiber.

### Spacing Scale
Always prefer parent `gap` over child `margin` to maintain a consistent spacing rhythm.
- **Page (desktop grids):** `gap-8` (2rem)
- **Section (logical groups):** `gap-6` (1.5rem)
- **Default (inputs, list items):** `gap-4` (1rem)
- **Tight (title + subtitle):** `gap-3` (0.75rem)

### Component Bounds
- **Reading width:** `max-w-prose`, `max-w-3xl`, or `max-w-5xl`.
- **Forms:** `max-w-md` or `max-w-2xl` (never full-width inputs on desktop).
- **Grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with `gap-6 md:gap-8`.
