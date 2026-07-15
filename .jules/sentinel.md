## 2026-07-15 - Hardcoded Authorization Bypass in Layout
**Vulnerability:** A specific hardcoded email address (`iamjuancss@gmail.com`) was automatically elevated to the 'admin' role upon login in the frontend code (`src/components/layout/Layout.jsx`).
**Learning:** Authorization rules and role assignments should never be handled automatically on the client side based on hardcoded identifiers. This allows easy privilege escalation if the client code is inspected or manipulated.
**Prevention:** Role assignment and authorization checks must always be enforced strictly on the backend/server-side (e.g., via Supabase Row Level Security or secure backend functions), never as a client-side conditional.
