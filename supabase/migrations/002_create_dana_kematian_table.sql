-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE status_ahli_waris_enum AS ENUM (
    'istri',
    'suami',
    'anak',
    'keluarga'
);

CREATE TYPE status_proses_dakem_enum AS ENUM (
    'dilaporkan',
    'verifikasi_cabang',
    'proses_pusat',
    'selesai'
);

-- =====================================================
-- TABLE
-- =====================================================

CREATE TABLE dana_kematian (

    --------------------------------------------------
    -- PRIMARY
    --------------------------------------------------

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    anggota_id UUID REFERENCES anggota(id) ON DELETE SET NULL,

    --------------------------------------------------
    -- DATA ANGGOTA
    --------------------------------------------------

    nama_anggota VARCHAR(200) NOT NULL,
    status_anggota status_anggota_enum NOT NULL,
    status_mps status_mps_enum NOT NULL,

    --------------------------------------------------
    -- DATA KEMATIAN
    --------------------------------------------------

    tanggal_meninggal DATE NOT NULL,
    penyebab_meninggal TEXT,

    --------------------------------------------------
    -- DATA PELAPORAN
    --------------------------------------------------

    tanggal_lapor_keluarga DATE,

    cabang_asal_melapor VARCHAR(120) NOT NULL,

    cabang_nama_pelapor VARCHAR(150),
    cabang_nik_pelapor VARCHAR(25),

    --------------------------------------------------
    -- PROSES CABANG
    --------------------------------------------------

    cabang_tanggal_awal_terima_berkas DATE,
    cabang_tanggal_kirim_ke_pusat DATE,

    --------------------------------------------------
    -- PROSES PUSAT
    --------------------------------------------------

    pusat_tanggal_awal_terima DATE,
    pusat_tanggal_validasi DATE,
    pusat_tanggal_selesai DATE,

    --------------------------------------------------
    -- DANA
    --------------------------------------------------

    besaran_dana_kematian NUMERIC(14,2) NOT NULL,

    --------------------------------------------------
    -- PENYERAHAN KE AHLI WARIS
    --------------------------------------------------

    cabang_tanggal_serah_ke_ahli_waris DATE,
    cabang_tanggal_lapor_ke_pusat DATE,

    --------------------------------------------------
    -- DATA AHLI WARIS
    --------------------------------------------------

    nama_ahli_waris VARCHAR(200) NOT NULL,
    status_ahli_waris status_ahli_waris_enum NOT NULL,

    --------------------------------------------------
    -- FILE DOKUMEN
    --------------------------------------------------

    file_sk_pensiun TEXT,
    file_surat_kematian TEXT,
    file_surat_pernyataan_ahli_waris TEXT,
    file_kartu_keluarga TEXT,
    file_e_ktp TEXT,
    file_surat_nikah TEXT,

    --------------------------------------------------
    -- STATUS PROSES
    --------------------------------------------------

    status_proses status_proses_dakem_enum DEFAULT 'dilaporkan',

    --------------------------------------------------
    -- CATATAN
    --------------------------------------------------

    keterangan TEXT,

    --------------------------------------------------
    -- TIMESTAMP
    --------------------------------------------------

    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXING (VERY IMPORTANT)
-- =====================================================

-- Query berdasarkan anggota
CREATE INDEX idx_dakem_anggota
ON dana_kematian(anggota_id);

-- Query laporan per cabang
CREATE INDEX idx_dakem_cabang
ON dana_kematian(cabang_asal_melapor);

-- Query laporan per tanggal meninggal
CREATE INDEX idx_dakem_tanggal_meninggal
ON dana_kematian(tanggal_meninggal DESC);

-- Query proses
CREATE INDEX idx_dakem_status_proses
ON dana_kematian(status_proses);

-- Query laporan per tahun
CREATE INDEX idx_dakem_tahun_meninggal
ON dana_kematian(EXTRACT(YEAR FROM tanggal_meninggal));

-- Soft delete
CREATE INDEX idx_dakem_not_deleted
ON dana_kematian(id)
WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGER UPDATE UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_dakem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_dakem_updated_at
BEFORE UPDATE ON dana_kematian
FOR EACH ROW
EXECUTE FUNCTION update_dakem_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE dana_kematian IS 'Tabel dana kematian anggota P2TEL';

COMMENT ON COLUMN dana_kematian.id IS 'Primary key dana kematian';
COMMENT ON COLUMN dana_kematian.anggota_id IS 'Relasi ke tabel anggota';
COMMENT ON COLUMN dana_kematian.nama_anggota IS 'Nama anggota yang meninggal';
COMMENT ON COLUMN dana_kematian.status_anggota IS 'Status anggota dalam keluarga';
COMMENT ON COLUMN dana_kematian.status_mps IS 'Status MPS anggota';
COMMENT ON COLUMN dana_kematian.tanggal_meninggal IS 'Tanggal meninggal anggota';
COMMENT ON COLUMN dana_kematian.penyebab_meninggal IS 'Penyebab meninggal dunia';
COMMENT ON COLUMN dana_kematian.tanggal_lapor_keluarga IS 'Tanggal keluarga melapor ke cabang';
COMMENT ON COLUMN dana_kematian.cabang_asal_melapor IS 'Cabang tempat laporan awal';
COMMENT ON COLUMN dana_kematian.cabang_nama_pelapor IS 'Nama petugas cabang yang menerima laporan';
COMMENT ON COLUMN dana_kematian.cabang_nik_pelapor IS 'NIK petugas cabang';
COMMENT ON COLUMN dana_kematian.besaran_dana_kematian IS 'Nominal dana kematian yang diberikan';
COMMENT ON COLUMN dana_kematian.nama_ahli_waris IS 'Nama ahli waris penerima dana';
COMMENT ON COLUMN dana_kematian.status_ahli_waris IS 'Hubungan ahli waris dengan anggota';
COMMENT ON COLUMN dana_kematian.status_proses IS 'Status proses dana kematian';
COMMENT ON COLUMN dana_kematian.keterangan IS 'Catatan tambahan proses dana kematian';
COMMENT ON COLUMN dana_kematian.deleted_at IS 'Soft delete timestamp';