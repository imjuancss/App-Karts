-- Migration: Fix missing DELETE policies for Championships to allow creators to securely remove their own data
-- Path: supabase/migrations/20260721165325_fix_championship_delete_policy.sql

-- 1. DELETE policy for championships
DROP POLICY IF EXISTS "Creators or admins can delete championships." ON public.championships;
CREATE POLICY "Creators or admins can delete championships." ON public.championships FOR DELETE
USING (
  auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

-- 2. DELETE policy for championship_rounds
DROP POLICY IF EXISTS "Creators or admins can delete championship rounds." ON public.championship_rounds;
CREATE POLICY "Creators or admins can delete championship rounds." ON public.championship_rounds FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.championships
    WHERE public.championships.id = championship_rounds.championship_id
    AND (
      public.championships.creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
      )
    )
  )
);

-- 3. DELETE policy for championship_participants
DROP POLICY IF EXISTS "Creators or admins can delete championship participants." ON public.championship_participants;
CREATE POLICY "Creators or admins can delete championship participants." ON public.championship_participants FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.championships
    WHERE public.championships.id = championship_participants.championship_id
    AND (
      public.championships.creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
      )
    )
  )
);

-- 4. DELETE policy for championship_invitations
DROP POLICY IF EXISTS "Creators or admins can delete championship invitations." ON public.championship_invitations;
CREATE POLICY "Creators or admins can delete championship invitations." ON public.championship_invitations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.championships
    WHERE public.championships.id = championship_invitations.championship_id
    AND (
      public.championships.creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
      )
    )
  )
);

-- 5. DELETE policy for championship_round_times
DROP POLICY IF EXISTS "Creators or admins can delete championship round times." ON public.championship_round_times;
CREATE POLICY "Creators or admins can delete championship round times." ON public.championship_round_times FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.championship_rounds
    JOIN public.championships ON public.championships.id = public.championship_rounds.championship_id
    WHERE public.championship_rounds.id = championship_round_times.round_id
    AND (
      public.championships.creator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
      )
    )
  )
);
