import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our migration
export type KategoriAnggotaEnum = 'biasa' | 'luar_biasa' | 'kehormatan' | 'bukan_anggota';
export type StatusAnggotaEnum = 'pegawai' | 'istri_1' | 'suami' | 'istri_2' | 'istri_3' | 'anak_1' | 'anak_2' | 'anak_3' | 'meninggal';
export type StatusMpsEnum = 'mps' | 'non_mps';
export type StatusIuranEnum = 'sudah_ttd' | 'belum_ttd' | 'tidak_iuran';
export type JenisKelaminEnum = 'laki_laki' | 'perempuan';
export type SkPensiunEnum = 'pensiun' | 'janda' | 'duda' | 'anak';
export type StatusPerkawinanEnum = 'belum_kawin' | 'kawin' | 'cerai_hidup' | 'cerai_mati';
export type AgamaEnum = 'islam' | 'kristen' | 'katolik' | 'hindu' | 'buddha' | 'konghucu';
export type GolonganDarahEnum = 'A' | 'B' | 'AB' | 'O';

export interface Anggota {
  id: string;
  user_id: string | null;
  nik: string;
  nama_anggota: string;
  kategori_anggota: KategoriAnggotaEnum;
  status_anggota: StatusAnggotaEnum;
  status_mps: StatusMpsEnum;
  status_iuran: StatusIuranEnum;
  status_kepesertaan: string | null;
  nama_cabang: string;
  posisi_kepengurusan: string;
  cabang_kelas: string | null;
  cabang_area_regional: string | null;
  cabang_area_witel: string | null;
  pasutri: string | null;
  status_perkawinan: StatusPerkawinanEnum | null;
  sk_pensiun: SkPensiunEnum | null;
  nomor_sk_pensiun: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kota: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  nomor_handphone: string | null;
  nomor_telepon: string | null;
  email: string | null;
  sosial_media: string | null;
  e_ktp: string | null;
  kartu_keluarga: string | null;
  npwp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: JenisKelaminEnum | null;
  agama: AgamaEnum | null;
  golongan_darah: GolonganDarahEnum | null;
  besaran_iuran: number | null;
  form_kesediaan_iuran: boolean | null;
  nama_bank: string | null;
  norek_bank: string | null;
  kategori_bantuan: string | null;
  tanggal_terima_bantuan: string | null;
  gambar_kondisi_tempat_tinggal: string | null;
  alasan_mutasi: string | null;
  tanggal_mutasi: string | null;
  cabang_pengajuan_mutasi: string | null;
  pusat_pengesahan_mutasi: string | null;
  status_bpjs: boolean | null;
  bpjs_kelas: string | null;
  bpjs_insentif: boolean | null;
  kategori_datul: string | null;
  media_datul: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateAnggotaInput {
  nik: string;
  nama_anggota: string;
  kategori_anggota: KategoriAnggotaEnum;
  status_anggota: StatusAnggotaEnum;
  status_mps: StatusMpsEnum;
  status_iuran: StatusIuranEnum;
  nama_cabang: string;
  posisi_kepengurusan: string;
  status_kepesertaan?: string;
  cabang_kelas?: string;
  cabang_area_regional?: string;
  cabang_area_witel?: string;
  pasutri?: string;
  status_perkawinan?: StatusPerkawinanEnum;
  sk_pensiun?: SkPensiunEnum;
  nomor_sk_pensiun?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  nomor_handphone?: string;
  nomor_telepon?: string;
  email?: string;
  sosial_media?: string;
  e_ktp?: string;
  kartu_keluarga?: string;
  npwp?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: JenisKelaminEnum;
  agama?: AgamaEnum;
  golongan_darah?: GolonganDarahEnum;
  besaran_iuran?: number;
  form_kesediaan_iuran?: boolean;
  nama_bank?: string;
  norek_bank?: string;
  kategori_bantuan?: string;
  tanggal_terima_bantuan?: string;
  gambar_kondisi_tempat_tinggal?: string;
  alasan_mutasi?: string;
  tanggal_mutasi?: string;
  cabang_pengajuan_mutasi?: string;
  pusat_pengesahan_mutasi?: string;
  status_bpjs?: boolean;
  bpjs_kelas?: string;
  bpjs_insentif?: boolean;
  kategori_datul?: string;
  media_datul?: string;
}

export interface UpdateAnggotaInput extends Partial<CreateAnggotaInput> {}

export interface AnggotaFilter {
  search?: string;
  kategori_anggota?: KategoriAnggotaEnum;
  status_anggota?: StatusAnggotaEnum;
  status_mps?: StatusMpsEnum;
  status_iuran?: StatusIuranEnum;
  nama_cabang?: string;
  page?: number;
  limit?: number;
}

// Death benefits types
export type StatusAhliWarisEnum = 'istri' | 'suami' | 'anak' | 'keluarga';
export type StatusProsesDakemEnum = 'dilaporkan' | 'verifikasi_cabang' | 'proses_pusat' | 'selesai';

export interface DanaKematian {
  id: string;
  anggota_id: string | null;
  nama_anggota: string;
  status_anggota: StatusAnggotaEnum;
  status_mps: StatusMpsEnum;
  tanggal_meninggal: string;
  penyebab_meninggal: string | null;
  tanggal_lapor_keluarga: string | null;
  cabang_asal_melapor: string;
  cabang_nama_pelapor: string | null;
  cabang_nik_pelapor: string | null;
  cabang_tanggal_awal_terima_berkas: string | null;
  cabang_tanggal_kirim_ke_pusat: string | null;
  pusat_tanggal_awal_terima: string | null;
  pusat_tanggal_validasi: string | null;
  pusat_tanggal_selesai: string | null;
  besaran_dana_kematian: number;
  cabang_tanggal_serah_ke_ahli_waris: string | null;
  cabang_tanggal_lapor_ke_pusat: string | null;
  ahli_waris_nama: string;
  status_ahli_waris: StatusAhliWarisEnum;
  file_sk_pensiun: string | null;
  file_surat_kematian: string | null;
  file_surat_pernyataan_ahli_waris: string | null;
  file_kartu_keluarga: string | null;
  file_e_ktp: string | null;
  file_surat_nikah: string | null;
  status_proses: StatusProsesDakemEnum;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDanaKematianInput {
  anggota_id?: string;
  nama_anggota: string;
  status_anggota: StatusAnggotaEnum;
  status_mps: StatusMpsEnum;
  tanggal_meninggal: string;
  penyebab_meninggal?: string;
  tanggal_lapor_keluarga?: string;
  cabang_asal_melapor: string;
  cabang_nama_pelapor?: string;
  cabang_nik_pelapor?: string;
  cabang_tanggal_awal_terima_berkas?: string;
  cabang_tanggal_kirim_ke_pusat?: string;
  pusat_tanggal_awal_terima?: string;
  pusat_tanggal_validasi?: string;
  pusat_tanggal_selesai?: string;
  besaran_dana_kematian: number;
  cabang_tanggal_serah_ke_ahli_waris?: string;
  cabang_tanggal_lapor_ke_pusat?: string;
  ahli_waris_nama: string;
  status_ahli_waris: StatusAhliWarisEnum;
  file_sk_pensiun?: string;
  file_surat_kematian?: string;
  file_surat_pernyataan_ahli_waris?: string;
  file_kartu_keluarga?: string;
  file_e_ktp?: string;
  file_surat_nikah?: string;
  status_proses?: StatusProsesDakemEnum;
  keterangan?: string;
}

export interface UpdateDanaKematianInput extends Partial<CreateDanaKematianInput> {}

export interface DanaKematianFilter {
  search?: string;
  status_proses?: StatusProsesDakemEnum;
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