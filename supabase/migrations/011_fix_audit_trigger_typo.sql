-- =====================================================
-- FIX AUDIT TRIGGER TYPO AND LOGIC
-- =====================================================

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS trg_audit_dana_kematian ON dana_kematian;
DROP FUNCTION IF EXISTS audit_dana_kematian_changes();

-- Recreate the function with fixes
CREATE OR REPLACE FUNCTION audit_dana_kematian_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_dana_kematian (
            dana_kematian_id,
            action,
            actor_id,
            actor_role,
            actor_nama,
            new_data,
            changes
        )
        VALUES (
            NEW.id,
            'create',
            COALESCE((NEW.data_perubahan->>'actor_id')::text, 'system'),
            COALESCE(NEW.data_perubahan->>'actor_role', 'system'),
            COALESCE(NEW.data_perubahan->>'actor_nama', 'System'),
            row_to_json(NEW),
            jsonb_build_object('created', NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if significant fields changed
        IF (OLD.status_proses IS DISTINCT FROM NEW.status_proses OR
            OLD.besaran_dana_kematian IS DISTINCT FROM NEW.besaran_dana_kematian OR
            OLD.nama_ahli_waris IS DISTINCT FROM NEW.nama_ahli_waris) THEN

            INSERT INTO audit_dana_kematian (
                dana_kematian_id,
                action,
                actor_id,
                actor_role,
                actor_nama,
                old_data,
                new_data,
                changes
            )
            VALUES (
                NEW.id,
                CASE
                    WHEN OLD.status_proses IS DISTINCT FROM NEW.status_proses THEN 'transition'
                    WHEN OLD.besaran_dana_kematian IS DISTINCT FROM NEW.besaran_dana_kematian THEN 'calculate'
                    ELSE 'update'
                END,
                COALESCE((NEW.data_perubahan->>'actor_id')::text, 'system'),
                COALESCE(NEW.data_perubahan->>'actor_role', 'system'),
                COALESCE(NEW.data_perubahan->>'actor_nama', 'System'),
                row_to_json(OLD),
                row_to_json(NEW),
                jsonb_build_object(
                    'status_proses', array[OLD.status_proses, NEW.status_proses],
                    'besaran_dana', array[OLD.besaran_dana_kematian, NEW.besaran_dana_kematian]
                )
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_dana_kematian (
            dana_kematian_id,
            action,
            actor_id,
            actor_role,
            actor_nama,
            old_data,
            changes
        )
        VALUES (
            OLD.id,
            'delete',
            'system',
            'system',
            'System',
            row_to_json(OLD),
            jsonb_build_object('deleted', OLD.deleted_at)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_audit_dana_kematian
AFTER INSERT OR UPDATE OR DELETE ON dana_kematian
FOR EACH ROW
EXECUTE FUNCTION audit_dana_kematian_changes();
