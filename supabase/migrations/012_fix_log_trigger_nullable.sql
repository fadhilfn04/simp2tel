-- =====================================================
-- FIX LOG DANA KEMATIAN TRANSITION FUNCTION
-- =====================================================

-- Drop the old trigger
DROP TRIGGER IF EXISTS trg_log_status_change ON dana_kematian;

-- Recreate the function with better NULL handling
CREATE OR REPLACE FUNCTION log_dana_kematian_transition()
RETURNS TRIGGER AS $$
DECLARE
    actor_data JSONB;
BEGIN
    -- Extract actor information from new data, default to empty object if NULL
    actor_data := COALESCE(NEW.data_perubahan, '{}'::jsonb);

    -- Create history entry with proper NULL handling
    INSERT INTO riwayat_proses_dakem (
        dana_kematian_id,
        status_dari,
        status_ke,
        actor_id,
        actor_role,
        actor_nama,
        actor_cabang,
        catatan,
        data_perubahan
    )
    VALUES (
        NEW.id,
        OLD.status_proses,
        NEW.status_proses,
        COALESCE((actor_data->>'actor_id')::text, 'system'),
        COALESCE(actor_data->>'actor_role', 'system'),
        COALESCE(actor_data->>'actor_nama', 'System'),
        actor_data->>'actor_cabang',
        actor_data->>'catatan',
        NEW.data_perubahan
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for status changes
CREATE TRIGGER trg_log_status_change
AFTER UPDATE OF status_proses ON dana_kematian
FOR EACH ROW
WHEN (OLD.status_proses IS DISTINCT FROM NEW.status_proses)
EXECUTE FUNCTION log_dana_kematian_transition();
