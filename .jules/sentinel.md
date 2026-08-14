
## 2024-05-18 - Hardcoded Authorization Bypass
**Vulnerability:** Found a hardcoded backdoor in `src/components/layout/Layout.jsx` that automatically granted the `admin` role to a specific hardcoded email address (`iamjuancss@gmail.com`) upon login.
**Learning:** Hardcoded email addresses for role assignment present a critical authorization bypass vulnerability if left in production.
**Prevention:** Role management should be handled through secure administrative interfaces or proper backend seed scripts, not hardcoded into client-side components or frontend logic.
## 2024-07-18 - RLS Privilege Escalation via User Profile Metadata
**Vulnerability:** Users could escalate their privileges to 'admin' through two vectors: 1) by registering with the `preferred_username` metadata set to 'iamjuancss', tricking the `handle_new_user` trigger into granting admin rights; and 2) by updating the `role` column directly in their profile row using the `Users can update their own profile.` RLS `UPDATE` policy.
**Learning:** Security Definier functions that assign roles must only rely on trusted data (like the verified `new.email`), not user-provided metadata (`raw_user_meta_data`). Furthermore, when allowing users to update their own row via RLS, restricted columns (like `role` or `is_admin`) must be protected by a `BEFORE UPDATE` trigger to prevent unauthorized modifications.
**Prevention:** Always validate against trusted auth fields for role assignment. Use `BEFORE UPDATE` triggers to reject or ignore changes to restricted columns for non-admin users.
## 2026-07-21 - RLS Privilege Escalation via User Profile Metadata (Recurrence)
**Vulnerability:** The `handle_new_user` Supabase trigger could assign the `admin` role based on `v_username` matching 'iamjuancss'. Since `v_username` is initially derived from user-controlled metadata (`new.raw_user_meta_data->>'preferred_username'`), a malicious user could sign up with this preferred username to escalate privileges.
**Learning:** Security Definier functions that assign roles must strictly rely on trusted data (like the verified `new.email`), not user-provided metadata (`raw_user_meta_data`), even when constructing intermediate variables like usernames.
**Prevention:** Always validate against trusted auth fields for role assignment and ensure derived variables used for authorization do not stem from untrusted input.
## 2026-07-22 - RPC Privilege Escalation
**Vulnerability:** The `upsert_motorsport_news` function was created as `SECURITY DEFINER` and could be executed by any authenticated user. Because it blindly iterated over a JSON payload to upsert rows in `motorsport_news`, any standard user could bypass the intended RSS feed mechanism and inject arbitrary or malicious news content into the application.
**Learning:** `SECURITY DEFINER` functions in Supabase bypass Row Level Security (RLS). Therefore, they must implement strict authorization checks natively within the function block, especially if the execute permission is granted to `authenticated` or `anon` roles.
**Prevention:** Always validate the user's privilege level (e.g., checking for an `admin` role) at the very beginning of any `SECURITY DEFINER` function that performs sensitive write operations.
## 2026-08-03 - Points Column RLS Bypass on INSERT
**Vulnerability:** Users could manipulate their championship points upon insertion because the trigger preventing points escalation only fired on `UPDATE`, ignoring `INSERT`.
**Learning:** Security triggers meant to protect specific columns from IDOR/tampering must cover both `INSERT` and `UPDATE` operations if users have permissions to insert rows.
**Prevention:** Always define restrictive column protection triggers as `BEFORE INSERT OR UPDATE` instead of just `BEFORE UPDATE`.
## 2026-08-14 - XSS via Unsanitized Link Output
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `ProofReviewModal.jsx` where a user-controlled URL (`proofUrl`) was used directly in the `href` attribute of an anchor tag, allowing for malicious `javascript:` URI execution.
**Learning:** Directly binding unsanitized URLs into the `href` of `<a>` tags in React opens an attack vector for XSS if the data originates from untrusted user input.
**Prevention:** Always validate and sanitize external URLs to ensure they use safe protocols (e.g., enforcing that the URL string starts with `http` or `https`) before inserting them into an anchor's `href` attribute.
