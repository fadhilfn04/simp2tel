-- =====================================================
-- FIX AUDIT DANA KEMATIAN ACTOR_ID TYPE
-- =====================================================

-- Change actor_id column from UUID to VARCHAR to match trigger logic
-- The trigger stores TEXT from data_perubahan->>'actor_id'

-- Drop existing indexes
DROP INDEX IF EXISTS idx_audit_dakem_actor;

-- Alter column type
ALTER TABLE audit_dana_kematian
ALTER COLUMN actor_id TYPE VARCHAR(255);

-- Recreate index
CREATE INDEX idx_audit_dakem_actor ON audit_dana_kematian(actor_id);

-- Also fix riwayat_proses_dakem table if needed
ALTER TABLE riwayat_proses_dakem
ALTER COLUMN actor_id TYPE VARCHAR(255);

-- Add comments
COMMENT ON COLUMN audit_dana_kematian.actor_id IS 'ID actor yang melakukan aksi (disimpan sebagai text untuk fleksibilitas)';
COMMENT ON COLUMN riwayat_proses_dakem.actor_id IS 'ID actor yang melakukan perubahan status (disimpan sebagai text untuk fleksibilitas)';
