-- Migration: Prevent unauthorized points modification in championships on INSERT and UPDATE
-- Path: supabase/migrations/20260803000000_secure_points_insert.sql

-- 1. Update the function to prevent users from escalating their own points on both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.prevent_points_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_creator BOOLEAN;
  v_base_championship_id UUID;
BEGIN
  -- Allow service_role or superuser modifications directly
  IF current_setting('request.jwt.claims', true) IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check if the user making the request is already an admin
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Determine if the current user is the creator of the championship
  IF TG_TABLE_NAME = 'championship_participants' THEN
    v_base_championship_id := COALESCE(NEW.championship_id, OLD.championship_id);
    SELECT EXISTS (
      SELECT 1 FROM public.championships
      WHERE id = v_base_championship_id AND creator_id = auth.uid()
    ) INTO v_is_creator;
  ELSIF TG_TABLE_NAME = 'championship_round_times' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.championships c
      JOIN public.championship_rounds cr ON cr.championship_id = c.id
      WHERE cr.id = COALESCE(NEW.round_id, OLD.round_id) AND c.creator_id = auth.uid()
    ) INTO v_is_creator;
  END IF;

  -- Handle INSERT operations
  IF TG_OP = 'INSERT' THEN
    IF NEW.points IS NOT NULL AND NEW.points != 0 THEN
      IF NOT v_is_creator THEN
        -- If not creator or admin, reset points to default 0 on insert
        NEW.points = 0;
      END IF;
    END IF;
  -- Handle UPDATE operations
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.points IS DISTINCT FROM OLD.points THEN
      IF NOT v_is_creator THEN
        -- If not creator or admin, revert points to previous value on update
        NEW.points = OLD.points;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Re-attach the trigger to the championship_participants table for both INSERT and UPDATE
DROP TRIGGER IF EXISTS secure_points_participants_update ON public.championship_participants;
CREATE TRIGGER secure_points_participants_update
BEFORE INSERT OR UPDATE ON public.championship_participants
FOR EACH ROW
EXECUTE FUNCTION public.prevent_points_escalation();

-- 3. Re-attach the trigger to the championship_round_times table for both INSERT and UPDATE
DROP TRIGGER IF EXISTS secure_points_round_times_update ON public.championship_round_times;
CREATE TRIGGER secure_points_round_times_update
BEFORE INSERT OR UPDATE ON public.championship_round_times
FOR EACH ROW
EXECUTE FUNCTION public.prevent_points_escalation();
