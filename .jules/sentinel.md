
## 2024-05-18 - Hardcoded Authorization Bypass
**Vulnerability:** Found a hardcoded backdoor in `src/components/layout/Layout.jsx` that automatically granted the `admin` role to a specific hardcoded email address (`iamjuancss@gmail.com`) upon login.
**Learning:** Hardcoded email addresses for role assignment present a critical authorization bypass vulnerability if left in production.
**Prevention:** Role management should be handled through secure administrative interfaces or proper backend seed scripts, not hardcoded into client-side components or frontend logic.
