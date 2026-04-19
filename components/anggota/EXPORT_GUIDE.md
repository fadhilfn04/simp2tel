# Panduan Penggunaan ExportExcelModal

## Fitur

ExportExcelModal adalah komponen untuk menexport data anggota ke Excel dengan fitur:
- ✅ Pemilihan field yang ingin diexport
- ✅ Field wajib (NIK, Nama Anggota, Nama Cabang) tidak bisa dihapus
- ✅ Pengelompokan field berdasarkan kategori
- ✅ Preview jumlah data dan field yang dipilih
- ✅ Tombol "Pilih Semua" dan "Hapus Semua" untuk mempercepat seleksi

## Cara Menggunakan

### 1. Import Komponen

```tsx
import { ExportExcelModal } from '@/components/anggota/ExportExcelModal';
```

### 2. Tambahkan State untuk Modal

```tsx
const [exportModalOpen, setExportModalOpen] = useState(false);
```

### 3. Siapkan Data yang Akan Diexport

Data harus berupa array of objects dengan field lengkap:

```tsx
// Contoh data dari API atau database
const anggotaData = [
  {
    id: 1,
    nik: '3201123456789012',
    nama_anggota: 'Ahmad Supriadi',
    nama_cabang: 'Cabang Jakarta',
    kategori_anggota: 'biasa',
    status_anggota: 'pegawai',
    // ... field lainnya
  },
  // ... data lainnya
];
```

### 4. Tambahkan Tombol Export

```tsx
<Button
  onClick={() => setExportModalOpen(true)}
  variant="outline"
>
  <FileSpreadsheet className="h-4 w-4 mr-2" />
  Export Excel
</Button>
```

### 5. Render Komponen ExportExcelModal

```tsx
<ExportExcelModal
  open={exportModalOpen}
  onClose={() => setExportModalOpen(false)}
  data={anggotaData}
/>
```

## Contoh Implementasi Lengkap

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportExcelModal } from '@/components/anggota/ExportExcelModal';

export default function AnggotaPage() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [anggotaData, setAnggotaData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari API
  useEffect(() => {
    const fetchAnggota = async () => {
      try {
        const response = await fetch('/api/anggota');
        const data = await response.json();
        setAnggotaData(data);
      } catch (error) {
        console.error('Error fetching anggota:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnggota();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header dengan Tombol Export */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Anggota</h1>
        <Button
          onClick={() => setExportModalOpen(true)}
          variant="outline"
          disabled={loading || anggotaData.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Tabel Data Anggota */}
      {/* ... komponen tabel anggota ... */}

      {/* Modal Export */}
      <ExportExcelModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={anggotaData}
      />
    </div>
  );
}
```

## Field yang Tersedia

### Informasi Dasar (Wajib)
- `nik` - NIK (Wajib)
- `nama_anggota` - Nama Anggota (Wajib)
- `nama_cabang` - Nama Cabang (Wajib)

### Kategori & Status
- `kategori_anggota` - Kategori Anggota
- `status_anggota` - Status Anggota
- `status_mps` - Status MPS
- `status_iuran` - Status Iuran
- `posisi_kepengurusan` - Posisi Kepengurusan
- `status_kepesertaan` - Status Kepesertaan

### Informasi Cabang
- `cabang_kelas` - Cabang Kelas
- `cabang_area_regional` - Cabang Area Regional
- `cabang_area_witel` - Cabang Area Witel

### Status Perkawinan & Keluarga
- `pasutri` - Pasutri
- `status_perkawinan` - Status Perkawinan

### Informasi Pensiun
- `sk_pensiun` - SK Pensiun
- `nomor_sk_pensiun` - Nomor SK Pensiun

### Alamat Lengkap
- `alamat` - Alamat
- `rt` - RT
- `rw` - RW
- `kelurahan` - Kelurahan
- `kecamatan` - Kecamatan
- `provinsi` - Provinsi
- `kota` - Kota
- `kode_pos` - Kode Pos

### Kontak
- `nomor_handphone` - Nomor Handphone
- `nomor_telepon` - Nomor Telepon
- `email` - Email
- `sosial_media` - Sosial Media

### Dokumen Identitas
- `e_ktp` - E-KTP
- `kartu_keluarga` - Kartu Keluarga
- `npwp` - NPWP

### Informasi Pribadi
- `tempat_lahir` - Tempat Lahir
- `tanggal_lahir` - Tanggal Lahir
- `jenis_kelamin` - Jenis Kelamin
- `agama` - Agama
- `golongan_darah` - Golongan Darah

### Informasi Iuran
- `besaran_iuran` - Besaran Iuran
- `form_kesediaan_iuran` - Form Kesediaan Iuran

### Informasi Bank
- `nama_bank` - Nama Bank
- `norek_bank` - Nomor Rekening

### Informasi Bantuan
- `kategori_bantuan` - Kategori Bantuan
- `tanggal_terima_bantuan` - Tanggal Terima Bantuan
- `gambar_kondisi_tempat_tinggal` - Gambar Kondisi Tempat Tinggal

### Informasi Mutasi
- `alasan_mutasi` - Alasan Mutasi
- `tanggal_mutasi` - Tanggal Mutasi
- `cabang_pengajuan_mutasi` - Cabang Pengajuan Mutasi
- `pusat_pengesahan_mutasi` - Pusat Pengesahan Mutasi

### Informasi BPJS
- `status_bpjs` - Status BPJS
- `bpjs_kelas` - Kelas BPJS
- `bpjs_insentif` - BPJS Insentif

### Informasi Datul
- `kategori_datul` - Kategori Datul
- `media_datul` - Media Datul

## Format Output File

File Excel yang diexport memiliki format:
- **Nama file**: `data_anggota_YYYY-MM-DD.xlsx` (dengan tanggal export)
- **Sheet name**: `Data Anggota`
- **Header**: Nama field yang dipilih (dalam format yang lebih mudah dibaca)
- **Column widths**: Auto-adjust berdasarkan konten

## Tips Penggunaan

1. **Export Data Besar**: Untuk data yang sangat besar (lebih dari 10.000 baris), pertimbangkan untuk membatasi field yang diexport hanya yang penting-penting saja.

2. **Default Selection**: Secara default hanya field wajib yang dipilih. User bisa memilih field tambahan sesuai kebutuhan.

3. **Preview Data**: Modal menampilkan jumlah data yang akan diexport, jadi user bisa memverifikasi sebelum download.

4. **Field Wajib**: NIK, Nama Anggota, dan Nama Cabang tidak bisa di-deselect karena merupakan identifier utama.

5. **Kategorisasi**: Field dikelompokkan berdasarkan kategori untuk memudahkan navigasi dan seleksi.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Status apakah modal sedang terbuka |
| `onClose` | `() => void` | Yes | Function yang dipanggil saat modal ditutup |
| `data` | `any[]` | Yes | Array of objects yang akan diexport |

## Dependencies

Komponen ini membutuhkan:
- `xlsx` - Library untuk generate Excel file
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `@/components/ui/*` - UI components (Dialog, Button, Checkbox, Badge, ScrollArea)
