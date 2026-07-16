## 2024-07-16 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** The app makes heavy use of Material Symbols via nested `<span>` elements inside `<button>` elements for icon-only actions (like "back", "edit", "share", and "close"). These buttons consistently lack `aria-label` attributes, which makes them inaccessible to screen reader users as there is no visible text.
**Action:** Always ensure that icon-only buttons include an appropriate, descriptive `aria-label` attribute on the parent `<button>` element to provide context for assistive technologies.
