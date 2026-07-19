## 2024-05-19 - Information Leakage via Supabase Errors
**Vulnerability:** Supabase Auth error messages (e.g., `error.message`) were being directly exposed to the UI in `src/pages/Auth/Auth.jsx`.
**Learning:** While Supabase attempts to provide safe error messages, passing them directly to the client can leak internal database state or allow email enumeration.
**Prevention:** Always intercept authentication or database errors and replace them with generic, safe fallback messages (e.g., "Credenciales incorrectas o ocurrió un error").
