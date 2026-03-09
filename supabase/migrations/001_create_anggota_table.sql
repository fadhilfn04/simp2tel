-- Migration: Create anggota (members) table
-- This table stores all member information for the pensioners union system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create anggota table
CREATE TABLE IF NOT EXISTS anggota (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identitas
  nikap VARCHAR(20) UNIQUE NOT NULL,
  nik_ktp VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,

  -- Status Informasi
  status_anggota VARCHAR(20) NOT NULL CHECK (status_anggota IN ('Aktif', 'Non-Aktif', 'Meninggal', 'Pindah')),
  jenis_anggota VARCHAR(20) NOT NULL CHECK (jenis_anggota IN ('Pensiunan', 'Janda/Duda', 'Tanggungan')),
  status_iuran VARCHAR(20) NOT NULL CHECK (status_iuran IN ('Lunas', 'Belum Lunas', 'Tidak Ada')),
  status_kesehatan VARCHAR(50) NOT NULL,

  -- Informasi Pribadi
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin VARCHAR(10) NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  agama VARCHAR(20) NOT NULL,
  golongan_darah VARCHAR(5),
  status_perkawinan VARCHAR(20) NOT NULL,

  -- Dokumen
  no_kk VARCHAR(20) UNIQUE,
  surat_nikah VARCHAR(50),
  sk_pensiun VARCHAR(50) NOT NULL,

  -- Kontak
  nomor_kontak VARCHAR(20) NOT NULL,
  email VARCHAR(255),

  -- Alamat
  alamat TEXT NOT NULL,
  rt VARCHAR(10) NOT NULL,
  rw VARCHAR(10) NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  kode_pos VARCHAR(10) NOT NULL,
  cabang_domisili VARCHAR(100) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_anggota_nikap ON anggota(nikap);
CREATE INDEX IF NOT EXISTS idx_anggota_nik_ktp ON anggota(nik_ktp);
CREATE INDEX IF NOT EXISTS idx_anggota_status_anggota ON anggota(status_anggota);
CREATE INDEX IF NOT EXISTS idx_anggota_jenis_anggota ON anggota(jenis_anggota);
CREATE INDEX IF NOT EXISTS idx_anggota_cabang_domisili ON anggota(cabang_domisili);
CREATE INDEX IF NOT EXISTS idx_anggota_nama ON anggota USING gin(to_tsvector('indonesian', nama));
CREATE INDEX IF NOT EXISTS idx_anggota_deleted_at ON anggota(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_anggota_updated_at
    BEFORE UPDATE ON anggota
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE anggota IS 'Tabel data anggota pensiunan Telkom';
COMMENT ON COLUMN anggota.id IS 'Primary key UUID';
COMMENT ON COLUMN anggota.nikap IS 'Nomor Induk Anggota Pensiunan';
COMMENT ON COLUMN anggota.nik_ktp IS 'Nomor Induk Kependudukan';
COMMENT ON COLUMN anggota.status_anggota IS 'Status keanggotaan saat ini';
COMMENT ON COLUMN anggota.jenis_anggota IS 'Kategori anggota pensiunan';
COMMENT ON COLUMN anggota.status_iuran IS 'Status pembayaran iuran';
COMMENT ON COLUMN anggota.deleted_at IS 'Soft delete timestamp';