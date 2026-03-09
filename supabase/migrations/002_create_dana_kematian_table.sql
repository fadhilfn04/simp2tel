-- Death benefits table
CREATE TABLE dana_kematian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id UUID NOT NULL REFERENCES anggota(id) ON DELETE SET NULL,
  nama_meninggal VARCHAR(255) NOT NULL,
  nik_ktp_meninggal VARCHAR(20) NOT NULL,
  nikap_meninggal VARCHAR(20) NOT NULL,
  tanggal_meninggal DATE NOT NULL,
  tempat_meninggal VARCHAR(100) NOT NULL,
  penyebab_meninggal TEXT,
  no_surat_kematian VARCHAR(100) UNIQUE,
  tanggal_surat_kematian DATE,

  -- Beneficiary info
  nama_ahli_waris VARCHAR(255) NOT NULL,
  hubungan_ahli_waris VARCHAR(50) NOT NULL,
  nik_ktp_ahli_waris VARCHAR(20) NOT NULL,
  alamat_ahli_waris TEXT NOT NULL,
  nomor_kontak_ahli_waris VARCHAR(20) NOT NULL,

  -- Benefit details
  jumlah_uang_duka DECIMAL(15,2) NOT NULL DEFAULT 0,
  mata_uang VARCHAR(10) DEFAULT 'IDR',
  status_pengajuan VARCHAR(50) NOT NULL DEFAULT 'Pending',
  catatan TEXT,

  -- Payment info
  tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_persetujuan DATE,
  tanggal_pembayaran DATE,
  metode_pembayaran VARCHAR(50),
  no_rekening VARCHAR(50),
  nama_bank VARCHAR(50),
  bukti_pembayaran TEXT,

  -- Documentation
  dokumen_kematian TEXT,
  dokumen_ahli_waris TEXT,
  dokumen_lain TEXT,

  -- Approval
  disetujui_oleh VARCHAR(255),
  catatan_persetujuan TEXT,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,

  CONSTRAINT check_status CHECK (status_pengajuan IN ('Pending', 'Dalam Proses', 'Disetujui', 'Ditolak', 'Dibayar', 'Selesai'))
);

-- Indexes for performance
CREATE INDEX idx_dana_kematian_anggota_id ON dana_kematian(anggota_id);
CREATE INDEX idx_dana_kematian_status ON dana_kematian(status_pengajuan);
CREATE INDEX idx_dana_kematian_tanggal_meninggal ON dana_kematian(tanggal_meninggal);
CREATE INDEX idx_dana_kematian_deleted_at ON dana_kematian(deleted_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dana_kematian_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dana_kematian_updated_at
  BEFORE UPDATE ON dana_kematian
  FOR EACH ROW
  EXECUTE FUNCTION update_dana_kematian_updated_at();

-- Comments for documentation
COMMENT ON TABLE dana_kematian IS 'Death benefits claims for deceased members';
COMMENT ON COLUMN dana_kematian.id IS 'Unique identifier';
COMMENT ON COLUMN dana_kematian.anggota_id IS 'Reference to deceased member';
COMMENT ON COLUMN dana_kematian.nama_meninggal IS 'Name of deceased member';
COMMENT ON COLUMN dana_kematian.nik_ktp_meninggal IS 'KTP of deceased member';
COMMENT ON COLUMN dana_kematian.nikap_meninggal IS 'Member ID of deceased';
COMMENT ON COLUMN dana_kematian.tanggal_meninggal IS 'Date of death';
COMMENT ON COLUMN dana_kematian.tempat_meninggal IS 'Place of death';
COMMENT ON COLUMN dana_kematian.penyebab_meninggal IS 'Cause of death';
COMMENT ON COLUMN dana_kematian.no_surat_kematian IS 'Death certificate number';
COMMENT ON COLUMN dana_kematian.nama_ahli_waris IS 'Beneficiary name';
COMMENT ON COLUMN dana_kematian.hubungan_ahli_waris IS 'Relationship to deceased';
COMMENT ON COLUMN dana_kematian.nik_ktp_ahli_waris IS 'Beneficiary KTP';
COMMENT ON COLUMN dana_kematian.jumlah_uang_duka IS 'Benefit amount';
COMMENT ON COLUMN dana_kematian.status_pengajuan IS 'Claim status';
COMMENT ON COLUMN dana_kematian.tanggal_pengajuan IS 'Claim submission date';
COMMENT ON COLUMN dana_kematian.tanggal_persetujuan IS 'Approval date';
COMMENT ON COLUMN dana_kematian.tanggal_pembayaran IS 'Payment date';