-- Trigger to automatically update rating_avg in tracks when a review is added/updated/deleted

CREATE OR REPLACE FUNCTION update_track_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE tracks
    SET rating_avg = (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM track_reviews
      WHERE track_id = NEW.track_id
    )
    WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks
    SET rating_avg = (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM track_reviews
      WHERE track_id = OLD.track_id
    )
    WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_track_rating ON track_reviews;

CREATE TRIGGER trigger_update_track_rating
AFTER INSERT OR UPDATE OR DELETE ON track_reviews
FOR EACH ROW
EXECUTE FUNCTION update_track_rating_avg();
