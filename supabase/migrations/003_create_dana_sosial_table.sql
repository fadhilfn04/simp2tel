-- Create dana_sosial table for social assistance management
CREATE TABLE IF NOT EXISTS dana_sosial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant Information
  anggota_id UUID REFERENCES anggota(id) ON DELETE SET NULL,
  nama_pemohon VARCHAR(255) NOT NULL,
  nikap_pemohon VARCHAR(50),
  hubungan_pemohon VARCHAR(100),
  no_telepon VARCHAR(20),

  -- Assistance Details
  jenis_bantuan VARCHAR(100) NOT NULL,
  alasan_pengajuan TEXT NOT NULL,
  jumlah_diajukan DECIMAL(15,2) NOT NULL DEFAULT 0,
  jumlah_disetujui DECIMAL(15,2) DEFAULT 0,

  -- Status and Workflow
  status_pengajuan VARCHAR(50) NOT NULL DEFAULT 'Pending',
  catatan_review TEXT,

  -- Approval Information
  disetujui_oleh VARCHAR(255),
  tanggal_disetujui TIMESTAMP,

  -- Payment Information
  status_penyaluran VARCHAR(50) DEFAULT 'Belum Disalurkan',
  tanggal_penyaluran DATE,
  metode_penyaluran VARCHAR(100),
  nama_penerima_dana VARCHAR(255),
  rekening_tujuan VARCHAR(50),
  bukti_penyaluran TEXT,

  -- Verification
  dokumen_pendukung TEXT[],
  diverifikasi_oleh VARCHAR(255),
  tanggal_verifikasi TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  -- Constraints
  CONSTRAINT check_jenis_bantuan CHECK (jenis_bantuan IN ('Medis', 'Pendidikan', 'Bencana Alam', 'Kematian Keluarga', 'Jaminan Sosial', 'Lainnya')),
  CONSTRAINT check_status_pengajuan CHECK (status_pengajuan IN ('Pending', 'Dalam Review', 'Disetujui', 'Ditolak', 'Disalurkan', 'Selesai')),
  CONSTRAINT check_status_penyaluran CHECK (status_penyaluran IN ('Belum Disalurkan', 'Dalam Proses', 'Sudah Disalurkan'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dana_sosial_anggota_id ON dana_sosial(anggota_id);
CREATE INDEX IF NOT EXISTS idx_dana_sosial_status_pengajuan ON dana_sosial(status_pengajuan);
CREATE INDEX IF NOT EXISTS idx_dana_sosial_jenis_bantuan ON dana_sosial(jenis_bantuan);
CREATE INDEX IF NOT EXISTS idx_dana_sosial_created_at ON dana_sosial(created_at);
CREATE INDEX IF NOT EXISTS idx_dana_sosial_deleted_at ON dana_sosial(deleted_at);

-- Create a view for active dana_sosial records (excluding soft-deleted)
CREATE OR REPLACE VIEW dana_sosial_active AS
SELECT *
FROM dana_sosial
WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON TABLE dana_sosial IS 'Table for managing social assistance applications and disbursements';
COMMENT ON COLUMN dana_sosial.anggota_id IS 'Reference to member if applicant is a member';
COMMENT ON COLUMN dana_sosial.nama_pemohon IS 'Name of the person applying for assistance';
COMMENT ON COLUMN dana_sosial.jenis_bantuan IS 'Type of assistance: Medis, Pendidikan, Bencana Alam, etc.';
COMMENT ON COLUMN dana_sosial.status_pengajuan IS 'Application status workflow';
COMMENT ON COLUMN dana_sosial.status_penyaluran IS 'Disbursement status';
COMMENT ON COLUMN dana_sosial.dokumen_pendukung IS 'Array of supporting document URLs';
COMMENT ON COLUMN dana_sosial.deleted_at IS 'Soft delete timestamp';
