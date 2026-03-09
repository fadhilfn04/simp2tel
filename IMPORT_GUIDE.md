# Panduan Import Data Anggota dari Excel

## 📋 Fitur Import Excel

Sistem mendukung import data anggota secara massal menggunakan file Excel (.xlsx, .xls) atau CSV.

## 🔧 Cara Menggunakan

### 1. Download Template
1. Klik tombol **"Import Excel"** di halaman Pengelolaan Data
2. Klik tombol **"Download Template Excel"**
3. Template akan terunduh sebagai `template_import_anggota.xlsx`

### 2. Isi Data
Buka template dan isi data anggota dengan format berikut:

#### Field Wajib (Required):
- **nik_ktp** - Nomor KTP (16 digit)
- **nama** - Nama lengkap anggota
- **tempat_lahir** - Kota kelahiran

#### Field Opsional (akan diisi default jika kosong):
- **nikap** - Nomor Induk Anggota
- **tanggal_lahir** - Tanggal lahir (format: YYYY-MM-DD)
- **status_anggota** - Status anggota (Aktif/Non-Aktif/Meninggal/Pindah)
- **jenis_anggota** - Jenis anggota (Pensiunan/Janda/Duda/Tanggungan)
- **status_iuran** - Status iuran (Lunas/Belum Lunas/Tidak Ada)
- **status_kesehatan** - Status kesehatan
- **jenis_kelamin** - Jenis kelamin (Laki-laki/Perempuan)
- **agama** - Agama
- **status_perkawinan** - Status perkawinan
- **sk_pensiun** - Nomor SK pensiun
- **nomor_kontak** - Nomor kontak
- **alamat** - Alamat lengkap
- **rt** - RT
- **rw** - RW
- **kelurahan** - Kelurahan
- **kecamatan** - Kecamatan
- **kota** - Kota
- **kode_pos** - Kode pos
- **cabang_domisili** - Cabang domisili
- **golongan_darah** - Golongan darah
- **no_kk** - Nomor Kartu Keluarga
- **surat_nikah** - Nomor surat nikah
- **email** - Email

### 3. Upload File
1. Klik tombol **"Import Excel"**
2. Drag & drop file Excel atau klik untuk memilih file
3. Sistem akan menampilkan preview data
4. Periksa data dan pastikan field wajib terisi
5. Klik **"Import X Data"** untuk memproses

## ✅ Validasi

Sistem akan memvalidasi:
- Field wajib harus terisi (nik_ktp, nama, tempat_lahir)
- Format NIK KTP harus valid
- Baris dengan data tidak lengkap akan dilewati

## 📊 Contoh Format Excel

| nik_ktp | nama | tempat_lahir | nikap | tanggal_lahir | status_anggota | jenis_anggota |
|---------|------|--------------|-------|---------------|----------------|---------------|
| 3201123456789012 | Ahmad Subarjo | Jakarta | 19801234 | 1960-01-01 | Aktif | Pensiunan |
| 3201123456789013 | Siti Aminah | Bandung | 19851235 | 1965-05-15 | Aktif | Janda |

## 🔍 Tips

1. **Backup Data**: Selalu backup data sebelum import massal
2. **Validasi**: Periksa preview data sebelum import
3. **Batch Size**: Untuk data > 100 baris, pertimbangkan untuk membagi menjadi beberapa file
4. **Duplicate Check**: Sistem akan menolak NIKAP/NIK KTP yang sudah ada
5. **Error Handling**: Baris dengan error tidak akan menghentikan proses import

## ⚠️ Batasan

- Maksimal 1000 baris per file
- File size maksimal 5MB
- Hanya mendukung format .xlsx, .xls, dan .csv
- Field tanggal harus dalam format YYYY-MM-DD

## 🆘 Troubleshooting

### File tidak terbaca
- Pastikan format file benar (.xlsx, .xls, atau .csv)
- Cek apakah file tidak korup
- Download template baru dan gunakan format yang benar

### Data tidak masuk semua
- Periksa apakah field wajib terisi
- Cek preview data sebelum import
- Baris dengan field wajib kosong akan dilewati

### NIK KTP duplikat
- Sistem akan menolak NIK KTP yang sudah terdaftar
- Periksa data yang sudah ada sebelum import

## 📞 Bantuan

Jika mengalami masalah:
1. Download template terbaru
2. Ikuti format yang sesuai
3. Hubungi admin sistem untuk bantuan lebih lanjut