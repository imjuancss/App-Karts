-- Fix: Revoke anon SELECT on championship_invitations (lint rule: Public Can See Object in GraphQL Schema)
-- Invitations are private data — only the inviter and the invited user should see them.

-- 1. Revoke direct SELECT from anon so the table disappears from the GraphQL schema
REVOKE SELECT ON public.championship_invitations FROM anon;

-- 2. Replace the permissive "everyone" policy with a restricted one
DROP POLICY IF EXISTS "Invitations are viewable by everyone" ON public.championship_invitations;

CREATE POLICY "Invitations visible to inviter and invited user"
ON public.championship_invitations
FOR SELECT
USING (
  auth.uid() = invited_by
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
