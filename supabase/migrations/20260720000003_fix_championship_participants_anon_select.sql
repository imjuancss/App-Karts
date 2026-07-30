-- Fix: Revoke anon SELECT on championship_participants (lint rule: Public Can See Object in GraphQL Schema)
-- Participants list should only be visible to authenticated users.

REVOKE SELECT ON public.championship_participants FROM anon;

DROP POLICY IF EXISTS "Participants are viewable by everyone." ON public.championship_participants;

CREATE POLICY "Authenticated users can view participants"
ON public.championship_participants
FOR SELECT
USING (auth.role() = 'authenticated');
