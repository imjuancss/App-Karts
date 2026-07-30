-- Fix: Restrict UPDATE on championship_invitations (lint rule: RLS Policy Always True)
-- Only the inviter should be able to update an invitation (e.g. change its status).

DROP POLICY IF EXISTS "Users can update invitations" ON public.championship_invitations;

CREATE POLICY "Inviter can update their invitations"
ON public.championship_invitations
FOR UPDATE
USING (auth.uid() = invited_by)
WITH CHECK (auth.uid() = invited_by);
