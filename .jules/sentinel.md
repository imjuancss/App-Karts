
## 2024-05-18 - Hardcoded Authorization Bypass
**Vulnerability:** Found a hardcoded backdoor in `src/components/layout/Layout.jsx` that automatically granted the `admin` role to a specific hardcoded email address (`iamjuancss@gmail.com`) upon login.
**Learning:** Hardcoded email addresses for role assignment present a critical authorization bypass vulnerability if left in production.
**Prevention:** Role management should be handled through secure administrative interfaces or proper backend seed scripts, not hardcoded into client-side components or frontend logic.
## 2024-07-18 - RLS Privilege Escalation via User Profile Metadata
**Vulnerability:** Users could escalate their privileges to 'admin' through two vectors: 1) by registering with the `preferred_username` metadata set to 'iamjuancss', tricking the `handle_new_user` trigger into granting admin rights; and 2) by updating the `role` column directly in their profile row using the `Users can update their own profile.` RLS `UPDATE` policy.
**Learning:** Security Definier functions that assign roles must only rely on trusted data (like the verified `new.email`), not user-provided metadata (`raw_user_meta_data`). Furthermore, when allowing users to update their own row via RLS, restricted columns (like `role` or `is_admin`) must be protected by a `BEFORE UPDATE` trigger to prevent unauthorized modifications.
**Prevention:** Always validate against trusted auth fields for role assignment. Use `BEFORE UPDATE` triggers to reject or ignore changes to restricted columns for non-admin users.
