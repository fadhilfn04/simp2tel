-- =====================================================
-- ENHANCE DANA KEMATIAN TABLE FOR WORKFLOW
-- =====================================================

-- Add new columns to support enhanced workflow
ALTER TABLE dana_kematian
ADD COLUMN IF NOT EXISTS nikap VARCHAR(25),
ADD COLUMN IF NOT EXISTS tempat_meninggal VARCHAR(255),
ADD COLUMN IF NOT EXISTS cabang_kontak_pelapor VARCHAR(50),
ADD COLUMN IF NOT EXISTS cabang_petugas_verifikator VARCHAR(255),
ADD COLUMN IF NOT EXISTS cabang_status_kelengkapan VARCHAR(50)
    CHECK (cabang_status_kelengkapan IN ('lengkap', 'kurang', 'tidak_lengkap')),
ADD COLUMN IF NOT EXISTS cabang_catatan_verifikasi TEXT,
ADD COLUMN IF NOT EXISTS pusat_petugas_validator VARCHAR(255),
ADD COLUMN IF NOT EXISTS pusat_petugas_approver VARCHAR(255),
ADD COLUMN IF NOT EXISTS pusat_nomor_referensi VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS kategori_dana VARCHAR(50)
    CHECK (kategori_dana IN ('rutin', 'khusus', 'premi', 'lainnya')),
ADD COLUMN IF NOT EXISTS metode_penyaluran VARCHAR(50)
    CHECK (metode_penyaluran IN ('transfer', 'tunai')),
ADD COLUMN IF NOT EXISTS rekening_tujuan VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_tujuan VARCHAR(100),
ADD COLUMN IF NOT EXISTS cabang_petugas_penyerah VARCHAR(255),
ADD COLUMN IF NOT EXISTS cabang_bukti_penyerahan TEXT,
ADD COLUMN IF NOT EXISTS nik_ahli_waris VARCHAR(25),
ADD COLUMN IF NOT EXISTS alamat_ahli_waris TEXT,
ADD COLUMN IF NOT EXISTS no_hp_ahli_waris VARCHAR(20),
ADD COLUMN IF NOT EXISTS file_buku_rekening TEXT,
ADD COLUMN IF NOT EXISTS file_surat_kuasa TEXT,
ADD COLUMN IF NOT EXISTS file_lainnya TEXT[],
ADD COLUMN IF NOT EXISTS alasan_penolakan TEXT,
ADD COLUMN IF NOT EXISTS dokumen_kurang TEXT[];

-- Update status enum to include more workflow states
-- First, create new enum type
CREATE TYPE status_proses_dakem_enum_new AS ENUM (
    'dilaporkan',
    'pending_dokumen',
    'verifikasi_cabang',
    'proses_pusat',
    'penyaluran',
    'selesai',
    'ditolak'
);

-- Migrate existing data
ALTER TABLE dana_kematian
    ALTER COLUMN status_proses DROP DEFAULT;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, status_proses FROM dana_kematian LOOP
        UPDATE dana_kematian
        SET status_proses = r.status_proses::text
        WHERE id = r.id;
    END LOOP;
END $$;

ALTER TABLE dana_kematian
    ALTER COLUMN status_proses TYPE status_proses_dakem_enum_new
    USING status_proses::text::status_proses_dakem_enum_new,
    ALTER COLUMN status_proses SET DEFAULT 'dilaporkan',
    ALTER COLUMN status_proses NOT NULL;

-- Drop old type and rename new one
DROP TYPE IF EXISTS status_proses_dakem_enum;
ALTER TYPE status_proses_dakem_enum_new RENAME TO status_proses_dakem_enum;

-- =====================================================
-- CREATE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS dokumen_kematian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dana_kematian_id UUID NOT NULL REFERENCES dana_kematian(id) ON DELETE CASCADE,

    jenis_dokumen VARCHAR(50) NOT NULL
        CHECK (jenis_dokumen IN (
            'surat_kematian',
            'sk_pensiun',
            'surat_ahli_waris',
            'kartu_keluarga',
            'ktp_ahli_waris',
            'surat_nikah',
            'buku_rekening',
            'surat_kuasa',
            'lainnya'
        )),

    nama_file VARCHAR(255) NOT NULL,
    url_file TEXT NOT NULL,
    ukuran_file BIGINT,
    mime_type VARCHAR(100),

    diupload_oleh UUID NOT NULL,
    tanggal_upload TIMESTAMPTZ DEFAULT timezone('utc', now()),

    status_verifikasi VARCHAR(20) DEFAULT 'pending'
        CHECK (status_verifikasi IN ('valid', 'invalid', 'pending', 'perlu_perbaikan')),
    catatan_verifikasi TEXT,
    diverifikasi_oleh UUID,
    tanggal_verifikasi TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    deleted_at TIMESTAMPTZ
);

-- Indexes for documents
CREATE INDEX idx_dokumen_kematian_claim ON dokumen_kematian(dana_kematian_id);
CREATE INDEX idx_dokumen_kematian_jenis ON dokumen_kematian(jenis_dokumen);
CREATE INDEX idx_dokumen_kematian_status ON dokumen_kematian(status_verifikasi);
CREATE INDEX idx_dokumen_kematian_not_deleted ON dokumen_kematian(id) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER trg_update_dokumen_kematian_updated_at
BEFORE UPDATE ON dokumen_kematian
FOR EACH ROW
EXECUTE FUNCTION update_dakem_updated_at();

-- Comment
COMMENT ON TABLE dokumen_kematian IS 'Dokumen pendukung klaim dana kematian';

-- =====================================================
-- CREATE PROCESS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS riwayat_proses_dakem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dana_kematian_id UUID NOT NULL REFERENCES dana_kematian(id) ON DELETE CASCADE,

    status_dari VARCHAR(50) NOT NULL,
    status_ke VARCHAR(50) NOT NULL,

    actor_id UUID NOT NULL,
    actor_role VARCHAR(20) NOT NULL
        CHECK (actor_role IN ('cabang', 'pusat', 'system')),
    actor_nama VARCHAR(255) NOT NULL,
    actor_cabang VARCHAR(120),

    catatan TEXT,
    data_perubahan JSONB,

    timestamp TIMESTAMPTZ DEFAULT timezone('utc', now()),

    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Indexes for history
CREATE INDEX idx_riwayat_dakem_claim ON riwayat_proses_dakem(dana_kematian_id, timestamp DESC);
CREATE INDEX idx_riwayat_dakem_actor ON riwayat_proses_dakem(actor_id);
CREATE INDEX idx_riwayat_dakem_transition ON riwayat_proses_dakem(status_dari, status_ke);

-- Comment
COMMENT ON TABLE riwayat_proses_dakem IS 'Riwayat perubahan status proses dana kematian';

-- =====================================================
-- CREATE BENEFIT CALCULATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS perhitungan_dana_kematian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dana_kematian_id UUID NOT NULL REFERENCES dana_kematian(id) ON DELETE CASCADE,

    kategori_anggota VARCHAR(50) NOT NULL,
    masa_kerja_tahun INTEGER NOT NULL,
    masa_kerja_bulan INTEGER DEFAULT 0,
    status_mps VARCHAR(20) NOT NULL,

    dasar_perhitungan NUMERIC(14,2) NOT NULL,
    tambahan_keluarga NUMERIC(14,2) DEFAULT 0,
    tambahan_mps NUMERIC(14,2) DEFAULT 0,
    tambahan_lainnya NUMERIC(14,2) DEFAULT 0,
    potongan NUMERIC(14,2) DEFAULT 0,

    total_dana NUMERIC(14,2) NOT NULL,

    rumus_perhitungan TEXT NOT NULL,
    detail_perhitungan JSONB,

    dihitung_oleh UUID NOT NULL,
    tanggal_perhitungan TIMESTAMPTZ DEFAULT timezone('utc', now()),
    disetujui_oleh UUID,
    tanggal_persetujuan TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Indexes for calculations
CREATE INDEX idx_perhitungan_dakem_claim ON perhitungan_dana_kematian(dana_kematian_id);
CREATE INDEX idx_perhitungan_dakem_dihitung_oleh ON perhitungan_dana_kematian(dihitung_oleh);

-- Trigger for updated_at
CREATE TRIGGER trg_update_perhitungan_dakem_updated_at
BEFORE UPDATE ON perhitungan_dana_kematian
FOR EACH ROW
EXECUTE FUNCTION update_dakem_updated_at();

-- Comment
COMMENT ON TABLE perhitungan_dana_kematian IS 'Perhitungan besaran dana kematian';

-- =====================================================
-- CREATE AUDIT/TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_dana_kematian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dana_kematian_id UUID NOT NULL REFERENCES dana_kematian(id) ON DELETE CASCADE,

    action VARCHAR(50) NOT NULL
        CHECK (action IN ('create', 'update', 'transition', 'approve', 'reject', 'distribute', 'document_upload', 'calculate')),
    actor_id UUID NOT NULL,
    actor_role VARCHAR(20) NOT NULL
        CHECK (actor_role IN ('cabang', 'pusat', 'admin', 'system')),
    actor_nama VARCHAR(255) NOT NULL,
    actor_ip VARCHAR(45),
    actor_user_agent TEXT,

    old_data JSONB,
    new_data JSONB,
    changes JSONB,

    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Indexes for audit
CREATE INDEX idx_audit_dakem_claim ON audit_dana_kematian(dana_kematian_id, created_at DESC);
CREATE INDEX idx_audit_dakem_action ON audit_dana_kematian(action);
CREATE INDEX idx_audit_dakem_actor ON audit_dana_kematian(actor_id);

-- Comment
COMMENT ON TABLE audit_dana_kematian IS 'Audit trail untuk semua aktivitas dana kematian';

-- =====================================================
-- CREATE TRIGGER FUNCTION FOR AUTOMATIC HISTORY
-- =====================================================

CREATE OR REPLACE FUNCTION log_dana_kematian_transition()
RETURNS TRIGGER AS $$
DECLARE
    actor_data JSON;
BEGIN
    -- Extract actor information from new data
    actor_data := COALESCE(NEW.data_perubahan->'actor', '{}'::json);

    -- Create history entry
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
        actor_data->>'actor_id',
        actor_data->>'actor_role',
        actor_data->>'actor_nama',
        actor_data->>'actor_cabang',
        actor_data->>'catatan',
        NEW.data_perubahan
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS trg_log_status_change ON dana_kematian;
CREATE TRIGGER trg_log_status_change
AFTER UPDATE OF status_proses ON dana_kematian
FOR EACH ROW
WHEN (OLD.status_proses IS DISTINCT FROM NEW.status_proses)
EXECUTE FUNCTION log_dana_kematian_transition();

-- =====================================================
-- CREATE TRIGGER FUNCTION FOR AUDIT
-- =====================================================

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
            NEW.data_perubahan->>'actor_id',
            NEW.data_perubahan->>'actor_role',
            NEW.data_perubahan->>'actor_nama',
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
                NEW.data_perubahan->>'actor_id',
                NEW.data_perubahan->>'actor_role',
                NEW.data_perdangan->>'actor_nama',
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

-- Create audit trigger
DROP TRIGGER IF EXISTS trg_audit_dana_kematian ON dana_kematian;
CREATE TRIGGER trg_audit_dana_kematian
AFTER INSERT OR UPDATE OR DELETE ON dana_kematian
FOR EACH ROW
EXECUTE FUNCTION audit_dana_kematian_changes();

-- =====================================================
-- CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for current status summary
CREATE OR REPLACE VIEW v_dana_kematian_summary AS
SELECT
    dk.status_proses,
    dk.cabang_asal_melapor,
    COUNT(*) as total,
    SUM(dk.besaran_dana_kematian) as total_dana,
    COUNT(*) FILTER (WHERE dk.status_proses = 'selesai') as selesai,
    COUNT(*) FILTER (WHERE dk.status_proses IN ('dilaporkan', 'pending_dokumen', 'verifikasi_cabang', 'proses_pusat', 'penyaluran')) as proses
FROM dana_kematian dk
WHERE dk.deleted_at IS NULL
GROUP BY dk.status_proses, dk.cabang_asal_melapor;

-- View for processing time statistics
CREATE OR REPLACE VIEW v_dana_kematian_processing_time AS
SELECT
    dk.id,
    dk.nama_anggota,
    dk.cabang_asal_melapor,
    dk.status_proses,
    dk.tanggal_lapor_keluarga,
    dk.cabang_tanggal_awal_terima_berkas,
    dk.cabang_tanggal_kirim_ke_pusat,
    dk.pusat_tanggal_awal_terima,
    dk.pusat_tanggal_validasi,
    dk.pusat_tanggal_selesai,
    dk.cabang_tanggal_serah_ke_ahli_waris,
    dk.cabang_tanggal_lapor_ke_pusat,
    EXTRACT(EPOCH FROM (COALESCE(dk.cabang_tanggal_lapor_ke_pusat, NOW()) - dk.tanggal_lapor_keluarga))/86400 as total_hari,
    EXTRACT(EPOCH FROM (dk.pusat_tanggal_validasi - dk.cabang_tanggal_kirim_ke_pusat))/86400 as hari_pusat_verifikasi,
    EXTRACT(EPOCH FROM (dk.cabang_tanggal_serah_ke_ahli_waris - dk.pusat_tanggal_selesai))/86400 as hari_penyaluran
FROM dana_kematian dk
WHERE dk.deleted_at IS NULL
    AND dk.status_proses = 'selesai';

-- View for document completeness
CREATE OR REPLACE VIEW v_dana_kematian_kelengkapan_dokumen AS
SELECT
    dk.id,
    dk.nama_anggota,
    dk.status_proses,
    dk.cabang_status_kelengkapan,
    COUNT(DISTINCT doc.id) as total_dokumen,
    COUNT(DISTINCT doc.id) FILTER (WHERE doc.status_verifikasi = 'valid') as dokumen_valid,
    COUNT(DISTINCT doc.id) FILTER (WHERE doc.status_verifikasi = 'pending') as dokumen_pending,
    CASE
        WHEN dk.cabang_status_kelengkapan = 'lengkap' THEN true
        ELSE false
    END as is_lengkap
FROM dana_kematian dk
LEFT JOIN dokumen_kematian doc ON doc.dana_kematian_id = dk.id AND doc.deleted_at IS NULL
WHERE dk.deleted_at IS NULL
GROUP BY dk.id, dk.nama_anggota, dk.status_proses, dk.cabang_status_kelengkapan;

-- =====================================================
-- ADD COMMENTS FOR NEW COLUMNS
-- =====================================================

COMMENT ON COLUMN dana_kematian.nikap IS 'Nomor Induk Karyawan Anggota Pensiun';
COMMENT ON COLUMN dana_kematian.tempat_meninggal IS 'Tempat meninggal anggota';
COMMENT ON COLUMN dana_kematian.cabang_kontak_pelapor IS 'Nomor kontak pelapor';
COMMENT ON COLUMN dana_kematian.cabang_petugas_verifikator IS 'Nama petugas cabang yang memverifikasi';
COMMENT ON COLUMN dana_kematian.cabang_status_kelengkapan IS 'Status kelengkapan dokumen: lengkap, kurang, tidak_lengkap';
COMMENT ON COLUMN dana_kematian.cabang_catatan_verifikasi IS 'Catatan hasil verifikasi cabang';
COMMENT ON COLUMN dana_kematian.pusat_petugas_validator IS 'Nama petugas pusat yang memvalidasi';
COMMENT ON COLUMN dana_kematian.pusat_petugas_approver IS 'Nama petugas pusat yang menyetujui';
COMMENT ON COLUMN dana_kematian.pusat_nomor_referensi IS 'Nomor referensi klaim dari pusat';
COMMENT ON COLUMN dana_kematian.kategori_dana IS 'Kategori dana: rutin, khusus, premi';
COMMENT ON COLUMN dana_kematian.metode_penyaluran IS 'Metode penyaluran dana: transfer, tunai';
COMMENT ON COLUMN dana_kematian.rekening_tujuan IS 'Nomor rekening tujuan penyaluran';
COMMENT ON COLUMN dana_kematian.bank_tujuan IS 'Nama bank tujuan';
COMMENT ON COLUMN dana_kematian.cabang_petugas_penyerah IS 'Nama petugas yang menyerahkan dana';
COMMENT ON COLUMN dana_kematian.cabang_bukti_penyerahan IS 'URL bukti penyerahan dana (foto/dokumen)';
COMMENT ON COLUMN dana_kematian.nik_ahli_waris IS 'Nomor KTP ahli waris';
COMMENT ON COLUMN dana_kematian.alamat_ahli_waris IS 'Alamat lengkap ahli waris';
COMMENT ON COLUMN dana_kematian.no_hp_ahli_waris IS 'Nomor handphone ahli waris';
COMMENT ON COLUMN dana_kematian.file_buku_rekening IS 'File buku rekening ahli waris';
COMMENT ON COLUMN dana_kematian.file_surat_kuasa IS 'File surat kuasa (jika ada)';
COMMENT ON COLUMN dana_kematian.file_lainnya IS 'File dokumentasi lainnya (array)';
COMMENT ON COLUMN dana_kematian.alasan_penolakan IS 'Alasan penolakan klaim';
COMMENT ON COLUMN dana_kematian.dokumen_kurang IS 'Daftar dokumen yang kurang (array)';
