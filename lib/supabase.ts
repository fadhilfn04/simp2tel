import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our migration
export interface Anggota {
  id: string;
  nikap: string;
  nik_ktp: string;
  nama: string;
  status_anggota: 'Aktif' | 'Non-Aktif' | 'Meninggal' | 'Pindah';
  jenis_anggota: 'Pensiunan' | 'Janda/Duda' | 'Tanggungan';
  status_iuran: 'Lunas' | 'Belum Lunas' | 'Tidak Ada';
  status_kesehatan: string;
  tempat_lahir: string | null;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  agama: string;
  golongan_darah: string;
  status_perkawinan: string;
  no_kk: string;
  surat_nikah: string;
  sk_pensiun: string;
  nomor_kontak: string;
  email: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kode_pos: string;
  cabang_domisili: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateAnggotaInput {
  nikap: string;
  nik_ktp: string;
  nama: string;
  status_anggota: Anggota['status_anggota'];
  jenis_anggota: Anggota['jenis_anggota'];
  status_iuran: Anggota['status_iuran'];
  status_kesehatan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: Anggota['jenis_kelamin'];
  agama: string;
  golongan_darah: string;
  status_perkawinan: string;
  no_kk: string;
  surat_nikah: string;
  sk_pensiun: string;
  nomor_kontak: string;
  email?: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kode_pos: string;
  cabang_domisili: string;
}

export interface UpdateAnggotaInput extends Partial<CreateAnggotaInput> {}

export interface AnggotaFilter {
  search?: string;
  status_anggota?: string;
  jenis_anggota?: string;
  status_iuran?: string;
  page?: number;
  limit?: number;
}

// Death benefits types
export type StatusPengajuan = 'Pending' | 'Dalam Proses' | 'Disetujui' | 'Ditolak' | 'Dibayar' | 'Selesai';

export interface DanaKematian {
  id: string;
  anggota_id: string;
  nama_meninggal: string;
  nik_ktp_meninggal: string;
  nikap_meninggal: string;
  tanggal_meninggal: string;
  tempat_meninggal: string;
  penyebab_meninggal: string | null;
  no_surat_kematian: string | null;
  tanggal_surat_kematian: string | null;
  nama_ahli_waris: string;
  hubungan_ahli_waris: string;
  nik_ktp_ahli_waris: string;
  alamat_ahli_waris: string;
  nomor_kontak_ahli_waris: string;
  jumlah_uang_duka: number;
  mata_uang: string;
  status_pengajuan: StatusPengajuan;
  catatan: string | null;
  tanggal_pengajuan: string;
  tanggal_persetujuan: string | null;
  tanggal_pembayaran: string | null;
  metode_pembayaran: string | null;
  no_rekening: string | null;
  nama_bank: string | null;
  bukti_pembayaran: string | null;
  dokumen_kematian: string | null;
  dokumen_ahli_waris: string | null;
  dokumen_lain: string | null;
  disetujui_oleh: string | null;
  catatan_persetujuan: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDanaKematianInput {
  anggota_id: string;
  nama_meninggal: string;
  nik_ktp_meninggal: string;
  nikap_meninggal: string;
  tanggal_meninggal: string;
  tempat_meninggal: string;
  penyebab_meninggal?: string;
  no_surat_kematian?: string;
  tanggal_surat_kematian?: string;
  nama_ahli_waris: string;
  hubungan_ahli_waris: string;
  nik_ktp_ahli_waris: string;
  alamat_ahli_waris: string;
  nomor_kontak_ahli_waris: string;
  jumlah_uang_duka: number;
  mata_uang?: string;
  status_pengajuan?: StatusPengajuan;
  catatan?: string;
  tanggal_pengajuan?: string;
  metode_pembayaran?: string;
  no_rekening?: string;
  nama_bank?: string;
}

export interface UpdateDanaKematianInput extends Partial<CreateDanaKematianInput> {
  tanggal_persetujuan?: string;
  tanggal_pembayaran?: string;
  disetujui_oleh?: string;
  catatan_persetujuan?: string;
}

export interface DanaKematianFilter {
  search?: string;
  status_pengajuan?: StatusPengajuan;
  tanggal_meninggal_from?: string;
  tanggal_meninggal_to?: string;
  page?: number;
  limit?: number;
}

// Social assistance types
export type StatusPengajuanSosial = 'Pending' | 'Dalam Review' | 'Disetujui' | 'Ditolak' | 'Disalurkan' | 'Selesai';
export type JenisBantuan = 'Medis' | 'Pendidikan' | 'Bencana Alam' | 'Kematian Keluarga' | 'Jaminan Sosial' | 'Lainnya';
export type StatusPenyaluran = 'Belum Disalurkan' | 'Dalam Proses' | 'Sudah Disalurkan';

export interface DanaSosial {
  id: string;
  anggota_id: string | null;
  nama_pemohon: string;
  nikap_pemohon: string | null;
  hubungan_pemohon: string;
  no_telepon: string;
  jenis_bantuan: JenisBantuan;
  alasan_pengajuan: string;
  jumlah_diajukan: number;
  jumlah_disetujui: number;
  status_pengajuan: StatusPengajuanSosial;
  catatan_review: string | null;
  disetujui_oleh: string | null;
  tanggal_disetujui: string | null;
  status_penyaluran: StatusPenyaluran;
  tanggal_penyaluran: string | null;
  metode_penyaluran: string | null;
  nama_penerima_dana: string | null;
  rekening_tujuan: string | null;
  bukti_penyaluran: string | null;
  dokumen_pendukung: string[] | null;
  diverifikasi_oleh: string | null;
  tanggal_verifikasi: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDanaSosialInput {
  anggota_id?: string;
  nama_pemohon: string;
  nikap_pemohon?: string;
  hubungan_pemohon: string;
  no_telepon: string;
  jenis_bantuan: JenisBantuan;
  alasan_pengajuan: string;
  jumlah_diajukan: number;
  status_pengajuan?: StatusPengajuanSosial;
  catatan_review?: string;
  status_penyaluran?: StatusPenyaluran;
  metode_penyaluran?: string;
  nama_penerima_dana?: string;
  rekening_tujuan?: string;
  dokumen_pendukung?: string[];
}

export interface UpdateDanaSosialInput extends Partial<CreateDanaSosialInput> {
  jumlah_disetujui?: number;
  disetujui_oleh?: string;
  tanggal_disetujui?: string;
  tanggal_penyaluran?: string;
  bukti_penyaluran?: string;
  diverifikasi_oleh?: string;
  tanggal_verifikasi?: string;
}

export interface DanaSosialFilter {
  search?: string;
  jenis_bantuan?: JenisBantuan;
  status_pengajuan?: StatusPengajuanSosial;
  status_penyaluran?: StatusPenyaluran;
  tanggal_pengajuan_from?: string;
  tanggal_pengajuan_to?: string;
  page?: number;
  limit?: number;
}