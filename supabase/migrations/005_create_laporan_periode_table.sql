-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE tipe_laporan_enum AS ENUM (
    'harian',
    'bulanan',
    'tahunan'
);

CREATE TYPE status_laporan_enum AS ENUM (
    'draft',
    'generated',
    'verified',
    'approved'
);

-- =====================================================
-- TABLE
-- =====================================================

CREATE TABLE laporan_periode (

    --------------------------------------------------
    -- PRIMARY
    --------------------------------------------------

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    --------------------------------------------------
    -- PERIODE
    --------------------------------------------------

    tipe_laporan tipe_laporan_enum NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,

    --------------------------------------------------
    -- PENDAPATAN
    --------------------------------------------------

    total_pendapatan NUMERIC(14,2) NOT NULL,
    sumbangan_anggota NUMERIC(14,2) DEFAULT 0,
    dana_kematian NUMERIC(14,2) DEFAULT 0,
    dana_sosial NUMERIC(14,2) DEFAULT 0,
    pendapatan_investasi NUMERIC(14,2) DEFAULT 0,
    pendapatan_jasa NUMERIC(14,2) DEFAULT 0,
    pendapatan_lainnya NUMERIC(14,2) DEFAULT 0,

    --------------------------------------------------
    -- PENGELUARAN
    --------------------------------------------------

    total_pengeluaran NUMERIC(14,2) NOT NULL,
    klaim_kematian NUMERIC(14,2) DEFAULT 0,
    bantuan_sosial NUMERIC(14,2) DEFAULT 0,
    operasional NUMERIC(14,2) DEFAULT 0,
    gaji_dan_tunjangan NUMERIC(14,2) DEFAULT 0,
    biaya_administrasi NUMERIC(14,2) DEFAULT 0,
    biaya_pemasaran NUMERIC(14,2) DEFAULT 0,
    penyusutan NUMERIC(14,2) DEFAULT 0,
    pengeluaran_lainnya NUMERIC(14,2) DEFAULT 0,

    --------------------------------------------------
    -- LABA RUGI
    --------------------------------------------------

    laba_bersih NUMERIC(14,2) NOT NULL,
    marjin_laba NUMERIC(5,2),

    --------------------------------------------------
    -- ARUS KAS
    --------------------------------------------------

    kas_masuk NUMERIC(14,2) DEFAULT 0,
    kas_keluar NUMERIC(14,2) DEFAULT 0,
    arus_kas_bersih NUMERIC(14,2) DEFAULT 0,

    --------------------------------------------------
    -- NERACA
    --------------------------------------------------

    total_aset NUMERIC(14,2) DEFAULT 0,
    total_kewajiban NUMERIC(14,2) DEFAULT 0,
    total_ekuitas NUMERIC(14,2) DEFAULT 0,

    --------------------------------------------------
    -- STATISTIK
    --------------------------------------------------

    jumlah_transaksi INTEGER DEFAULT 0,
    jumlah_anggota INTEGER DEFAULT 0,

    --------------------------------------------------
    -- STATUS
    --------------------------------------------------

    status_laporan status_laporan_enum DEFAULT 'draft',

    --------------------------------------------------
    -- DOKUMENTASI
    --------------------------------------------------

    catatan TEXT,
    dibuat_olez VARCHAR(150),
    diverifikasi_oleh VARCHAR(150),
    tanggal_disetujui DATE,

    file_laporan TEXT,

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

-- Query berdasarkan tipe laporan
CREATE INDEX idx_laporan_tipe
ON laporan_periode(tipe_laporan);

-- Query berdasarkan periode
CREATE INDEX idx_laporan_periode
ON laporan_periode(tanggal_mulai DESC, tanggal_selesai DESC);

-- Query laporan bulanan
CREATE INDEX idx_laporan_bulan
ON laporan_periode(EXTRACT(YEAR FROM tanggal_mulai), EXTRACT(MONTH FROM tanggal_mulai));

-- Query laporan tahunan
CREATE INDEX idx_laporan_tahun
ON laporan_periode(EXTRACT(YEAR FROM tanggal_mulai));

-- Query berdasarkan status
CREATE INDEX idx_laporan_status
ON laporan_periode(status_laporan);

-- Soft delete
CREATE INDEX idx_laporan_not_deleted
ON laporan_periode(id)
WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGER UPDATE UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_laporan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_laporan_updated_at
BEFORE UPDATE ON laporan_periode
FOR EACH ROW
EXECUTE FUNCTION update_laporan_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE laporan_periode IS 'Tabel laporan keuangan periodik (harian, bulanan, tahunan)';

COMMENT ON COLUMN laporan_periode.id IS 'Primary key laporan periode';
COMMENT ON COLUMN laporan_periode.tipe_laporan IS 'Tipe laporan (harian, bulanan, tahunan)';
COMMENT ON COLUMN laporan_periode.tanggal_mulai IS 'Tanggal mulai periode';
COMMENT ON COLUMN laporan_periode.tanggal_selesai IS 'Tanggal selesai periode';
COMMENT ON COLUMN laporan_periode.total_pendapatan IS 'Total pendapatan periode';
COMMENT ON COLUMN laporan_periode.total_pengeluaran IS 'Total pengeluaran periode';
COMMENT ON COLUMN laporan_periode.laba_bersih IS 'Laba bersih periode';
COMMENT ON COLUMN laporan_periode.marjin_laba IS 'Marjin laba dalam persentase';
COMMENT ON COLUMN laporan_periode.jumlah_transaksi IS 'Total transaksi periode';
COMMENT ON COLUMN laporan_periode.status_laporan IS 'Status laporan';
COMMENT ON COLUMN laporan_periode.file_laporan IS 'URL file laporan PDF/Excel';
COMMENT ON COLUMN laporan_periode.deleted_at IS 'Soft delete timestamp';
