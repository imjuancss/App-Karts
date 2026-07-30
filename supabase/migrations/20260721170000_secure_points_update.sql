-- Migration: Prevent unauthorized points modification in championships
-- Path: supabase/migrations/20260721170000_secure_points_update.sql

-- 1. Create a function to prevent users from escalating their own points
CREATE OR REPLACE FUNCTION public.prevent_points_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_creator BOOLEAN;
BEGIN
  -- Allow service_role or superuser modifications directly
  IF current_setting('request.jwt.claims', true) IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check if points are being modified
  IF NEW.points IS DISTINCT FROM OLD.points THEN

    -- Check if the user making the request is already an admin
    IF EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN NEW;
    END IF;

    -- Check if user is the creator of the championship based on OLD record
    IF TG_TABLE_NAME = 'championship_participants' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.championships
        WHERE id = OLD.championship_id AND creator_id = auth.uid()
      ) INTO v_is_creator;
    ELSIF TG_TABLE_NAME = 'championship_round_times' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.championships c
        JOIN public.championship_rounds cr ON cr.championship_id = c.id
        WHERE cr.id = OLD.round_id AND c.creator_id = auth.uid()
      ) INTO v_is_creator;
    END IF;

    IF NOT v_is_creator THEN
      -- If not creator or admin, revert points to previous value
      NEW.points = OLD.points;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the championship_participants table
DROP TRIGGER IF EXISTS secure_points_participants_update ON public.championship_participants;
CREATE TRIGGER secure_points_participants_update
BEFORE UPDATE ON public.championship_participants
FOR EACH ROW
EXECUTE FUNCTION public.prevent_points_escalation();

-- 3. Attach the trigger to the championship_round_times table
DROP TRIGGER IF EXISTS secure_points_round_times_update ON public.championship_round_times;
CREATE TRIGGER secure_points_round_times_update
BEFORE UPDATE ON public.championship_round_times
FOR EACH ROW
EXECUTE FUNCTION public.prevent_points_escalation();
