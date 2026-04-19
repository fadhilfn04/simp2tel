-- =====================================================
-- FIX DANA KEMATIAN DATA_PERUBAHAN FIELD
-- =====================================================

-- Add data_perubahan field to dana_kematian table
-- This field is needed by the audit triggers in migration 006
ALTER TABLE dana_kematian
ADD COLUMN IF NOT EXISTS data_perubahan JSONB DEFAULT '{"actor_id": null, "actor_role": null, "actor_nama": null}'::jsonb;

-- Add comment
COMMENT ON COLUMN dana_kematian.data_perubahan IS 'Metadata tentang actor yang melakukan create/update (id, role, nama, catatan)';
