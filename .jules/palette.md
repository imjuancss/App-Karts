## 2024-05-18 - Missing keyboard interactions in custom UI
**Learning:** Found multiple instances where interactive elements and inputs lack essential semantic relationships (`htmlFor`, `id`) and visual focus states (`focus-visible`). This is a common pattern when quickly building UI forms in React.
**Action:** When creating form layouts, always pair `<label>` with `<Input>` properly. Ensure all interactive custom UI like icon buttons have `title` tooltips and visible keyboard focus boundaries for screen readers and power users.
