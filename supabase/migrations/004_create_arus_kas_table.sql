-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE jenis_transaksi_enum AS ENUM (
    'masuk',
    'keluar'
);

CREATE TYPE kategori_transaksi_enum AS ENUM (
    'sumbangan_anggota',
    'dana_kematian',
    'dana_sosial',
    'iuran_bulanan',
    'pendapatan_investasi',
    'pendapatan_jasa',
    'pendapatan_lainnya',
    'klaim_kematian',
    'bantuan_sosial',
    'operasional',
    'gaji_dan_tunjangan',
    'biaya_administrasi',
    'biaya_pemasaran',
    'penyusutan',
    'pengeluaran_lainnya'
);

-- =====================================================
-- TABLE
-- =====================================================

CREATE TABLE arus_kas (

    --------------------------------------------------
    -- PRIMARY
    --------------------------------------------------

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    --------------------------------------------------
    -- TRANSAKSI
    --------------------------------------------------

    tanggal_transaksi DATE NOT NULL,
    jenis_transaksi jenis_transaksi_enum NOT NULL,
    kategori_transaksi kategori_transaksi_enum NOT NULL,

    jumlah_transaksi NUMERIC(14,2) NOT NULL,

    --------------------------------------------------
    -- DESKRIPSI
    --------------------------------------------------

    deskripsi VARCHAR(500) NOT NULL,
    nomor_referensi VARCHAR(50) UNIQUE,

    --------------------------------------------------
    -- RELASI (OPTIONAL)
    --------------------------------------------------

    anggota_id UUID REFERENCES anggota(id) ON DELETE SET NULL,
    dana_kematian_id UUID REFERENCES dana_kematian(id) ON DELETE SET NULL,
    dana_sosial_id UUID REFERENCES dana_sosial(id) ON DELETE SET NULL,
    pembayaran_sumbangan_id UUID REFERENCES pembayaran_sumbangan(id) ON DELETE SET NULL,

    --------------------------------------------------
    -- SALDO
    --------------------------------------------------

    saldo_awal NUMERIC(14,2),
    saldo_akhir NUMERIC(14,2),

    --------------------------------------------------
    -- METODE PEMBAYARAN
    --------------------------------------------------

    metode_pembayaran VARCHAR(50),
    akun_bank VARCHAR(50),

    --------------------------------------------------
    -- DOKUMENTASI
    --------------------------------------------------

    bukti_transaksi TEXT,
    catatan TEXT,

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

-- Query berdasarkan tanggal
CREATE INDEX idx_arus_kas_tanggal
ON arus_kas(tanggal_transaksi DESC);

-- Query berdasarkan jenis transaksi
CREATE INDEX idx_arus_kas_jenis
ON arus_kas(jenis_transaksi);

-- Query berdasarkan kategori
CREATE INDEX idx_arus_kas_kategori
ON arus_kas(kategori_transaksi);

-- Query berdasarkan anggota
CREATE INDEX idx_arus_kas_anggota
ON arus_kas(anggota_id);

-- Query laporan bulanan
CREATE INDEX idx_arus_kas_bulan
ON arus_kas(EXTRACT(YEAR FROM tanggal_transaksi), EXTRACT(MONTH FROM tanggal_transaksi));

-- Query laporan tahunan
CREATE INDEX idx_arus_kas_tahun
ON arus_kas(EXTRACT(YEAR FROM tanggal_transaksi));

-- Soft delete
CREATE INDEX idx_arus_kas_not_deleted
ON arus_kas(id)
WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGER UPDATE UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_arus_kas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_arus_kas_updated_at
BEFORE UPDATE ON arus_kas
FOR EACH ROW
EXECUTE FUNCTION update_arus_kas_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE arus_kas IS 'Tabel arus kas (cash flow) organisasi';

COMMENT ON COLUMN arus_kas.id IS 'Primary key arus kas';
COMMENT ON COLUMN arus_kas.tanggal_transaksi IS 'Tanggal transaksi';
COMMENT ON COLUMN arus_kas.jenis_transaksi IS 'Jenis transaksi (masuk/keluar)';
COMMENT ON COLUMN arus_kas.kategori_transaksi IS 'Kategori transaksi';
COMMENT ON COLUMN arus_kas.jumlah_transaksi IS 'Nominal transaksi';
COMMENT ON COLUMN arus_kas.deskripsi IS 'Deskripsi transaksi';
COMMENT ON COLUMN arus_kas.nomor_referensi IS 'Nomor referensi unik';
COMMENT ON COLUMN arus_kas.saldo_awal IS 'Saldo sebelum transaksi';
COMMENT ON COLUMN arus_kas.saldo_akhir IS 'Saldo setelah transaksi';
COMMENT ON COLUMN arus_kas.metode_pembayaran IS 'Metode pembayaran';
COMMENT ON COLUMN arus_kas.akun_bank IS 'Akun bank yang digunakan';
COMMENT ON COLUMN arus_kas.bukti_transaksi IS 'URL bukti transaksi';
COMMENT ON COLUMN arus_kas.deleted_at IS 'Soft delete timestamp';
