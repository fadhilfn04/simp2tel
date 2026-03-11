-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE status_pembayaran_enum AS ENUM (
    'pending',
    'paid',
    'failed'
);

CREATE TYPE tipe_sumbangan_enum AS ENUM (
    'sumbangan_bulanan',
    'sumbangan_kematian',
    'sumbangan_khusus',
    'sumbangan_investasi',
    'sumbangan_lainnya'
);

-- =====================================================
-- TABLE
-- =====================================================

CREATE TABLE pembayaran_sumbangan (

    --------------------------------------------------
    -- PRIMARY
    --------------------------------------------------

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    anggota_id UUID REFERENCES anggota(id) ON DELETE SET NULL,

    --------------------------------------------------
    -- DATA ANGGOTA
    --------------------------------------------------

    nama_anggota VARCHAR(200) NOT NULL,
    nik VARCHAR(25),

    --------------------------------------------------
    -- PEMBAYARAN
    --------------------------------------------------

    tanggal_transaksi DATE NOT NULL,
    jumlah_pembayaran NUMERIC(14,2) NOT NULL,

    tipe_sumbangan tipe_sumbangan_enum NOT NULL,

    --------------------------------------------------
    -- STATUS
    --------------------------------------------------

    status_pembayaran status_pembayaran_enum DEFAULT 'pending',

    --------------------------------------------------
    -- REFERENSI
    --------------------------------------------------

    nomor_referensi VARCHAR(50) UNIQUE,
    keterangan_pembayaran TEXT,

    --------------------------------------------------
    -- METODE PEMBAYARAN
    --------------------------------------------------

    metode_pembayaran VARCHAR(50),
    bukti_pembayaran TEXT,

    --------------------------------------------------
    -- VERIFIKASI
    --------------------------------------------------

    tanggal_verifikasi DATE,
    diverifikasi_oleh VARCHAR(150),
    catatan_verifikasi TEXT,

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
CREATE INDEX idx_pembayaran_anggota
ON pembayaran_sumbangan(anggota_id);

-- Query laporan per status
CREATE INDEX idx_pembayaran_status
ON pembayaran_sumbangan(status_pembayaran);

-- Query laporan per tipe
CREATE INDEX idx_pembayaran_tipe
ON pembayaran_sumbangan(tipe_sumbangan);

-- Query laporan per tanggal
CREATE INDEX idx_pembayaran_tanggal
ON pembayaran_sumbangan(tanggal_transaksi DESC);

-- Query laporan per bulan/tahun
CREATE INDEX idx_pembayaran_bulan
ON pembayaran_sumbangan(EXTRACT(YEAR FROM tanggal_transaksi), EXTRACT(MONTH FROM tanggal_transaksi));

-- Soft delete
CREATE INDEX idx_pembayaran_not_deleted
ON pembayaran_sumbangan(id)
WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGER UPDATE UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_pembayaran_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_pembayaran_updated_at
BEFORE UPDATE ON pembayaran_sumbangan
FOR EACH ROW
EXECUTE FUNCTION update_pembayaran_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE pembayaran_sumbangan IS 'Tabel pembayaran sumbangan anggota P2TEL';

COMMENT ON COLUMN pembayaran_sumbangan.id IS 'Primary key pembayaran sumbangan';
COMMENT ON COLUMN pembayaran_sumbangan.anggota_id IS 'Relasi ke tabel anggota';
COMMENT ON COLUMN pembayaran_sumbangan.nama_anggota IS 'Nama anggota pembayar';
COMMENT ON COLUMN pembayaran_sumbangan.nik IS 'NIK anggota';
COMMENT ON COLUMN pembayaran_sumbangan.tanggal_transaksi IS 'Tanggal pembayaran';
COMMENT ON COLUMN pembayaran_sumbangan.jumlah_pembayaran IS 'Nominal pembayaran';
COMMENT ON COLUMN pembayaran_sumbangan.tipe_sumbangan IS 'Tipe sumbangan';
COMMENT ON COLUMN pembayaran_sumbangan.status_pembayaran IS 'Status pembayaran';
COMMENT ON COLUMN pembayaran_sumbangan.nomor_referensi IS 'Nomor referensi unik';
COMMENT ON COLUMN pembayaran_sumbangan.metode_pembayaran IS 'Metode pembayaran (transfer, tunai, dll)';
COMMENT ON COLUMN pembayaran_sumbangan.bukti_pembayaran IS 'URL bukti pembayaran';
COMMENT ON COLUMN pembayaran_sumbangan.tanggal_verifikasi IS 'Tanggal verifikasi pembayaran';
COMMENT ON COLUMN pembayaran_sumbangan.diverifikasi_oleh IS 'Nama verifikator';
COMMENT ON COLUMN pembayaran_sumbangan.deleted_at IS 'Soft delete timestamp';
