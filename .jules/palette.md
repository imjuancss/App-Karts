## 2024-07-16 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** The app makes heavy use of Material Symbols via nested `<span>` elements inside `<button>` elements for icon-only actions (like "back", "edit", "share", and "close"). These buttons consistently lack `aria-label` attributes, which makes them inaccessible to screen reader users as there is no visible text.
**Action:** Always ensure that icon-only buttons include an appropriate, descriptive `aria-label` attribute on the parent `<button>` element to provide context for assistive technologies.

## 2024-07-21 - Missing Focus States on Custom Components
**Learning:** The custom `KineticButton` and `KineticCard` components lacked visible focus states and proper keyboard interactions (like `tabIndex` and `onKeyDown` for cards acting as buttons). This makes keyboard navigation very difficult as users can't see which interactive element is currently focused or trigger it correctly with the keyboard.
**Action:** Always include `focus-visible:ring-2` (and related focus utility classes) on interactive components to ensure keyboard accessibility. When a `div` or custom component acts as a button (`onClick` is present), ensure it has `role="button"`, `tabIndex={0}`, and handles `Enter`/`Space` key presses.
