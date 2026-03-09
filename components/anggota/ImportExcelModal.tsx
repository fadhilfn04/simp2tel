import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<{ success: number; error: number }>;
}

export function ImportExcelModal({ open, onClose, onImport }: ImportExcelModalProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      await parseExcelFile(file);
    }
  };

  const parseExcelFile = async (file: File) => {
    try {
      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        blankrows: false
      });

      if (jsonData.length === 0) {
        alert('File kosong atau tidak ada data');
        return;
      }

      // Map and validate data
      const mappedData = jsonData.map((row: any) => ({
        nik_ktp: String(row.nik_ktp || row['NIK KTP'] || row['NIK_KTP'] || '').trim(),
        nama: String(row.nama || row['Nama'] || row['NAMA'] || '').trim(),
        tempat_lahir: String(row.tempat_lahir || row['Tempat Lahir'] || row['TEMPAT_LAHIR'] || '').trim(),
        // Optional fields
        nikap: String(row.nikap || row['NIKAP'] || '').trim(),
        tanggal_lahir: row.tanggal_lahir || row['Tanggal Lahir'] || new Date().toISOString().split('T')[0],
        status_anggota: row.status_anggota || row['Status Anggota'] || 'Aktif',
        jenis_anggota: row.jenis_anggota || row['Jenis Anggota'] || 'Pensiunan',
        status_iuran: row.status_iuran || row['Status Iuran'] || 'Lunas',
        status_kesehatan: row.status_kesehatan || row['Status Kesehatan'] || 'Sehat',
        jenis_kelamin: row.jenis_kelamin || row['Jenis Kelamin'] || 'Laki-laki',
        agama: row.agama || row['Agama'] || 'Islam',
        status_perkawinan: row.status_perkawinan || row['Status Perkawinan'] || 'Menikah',
        sk_pensiun: String(row.sk_pensiun || row['SK Pensiun'] || '').trim(),
        nomor_kontak: String(row.nomor_kontak || row['Nomor Kontak'] || '').trim(),
        alamat: String(row.alamat || row['Alamat'] || '').trim(),
        rt: String(row.rt || row['RT'] || '').trim(),
        rw: String(row.rw || row['RW'] || '').trim(),
        kelurahan: String(row.kelurahan || row['Kelurahan'] || '').trim(),
        kecamatan: String(row.kecamatan || row['Kecamatan'] || '').trim(),
        kota: String(row.kota || row['Kota'] || '').trim(),
        kode_pos: String(row.kode_pos || row['Kode Pos'] || '').trim(),
        cabang_domisili: String(row.cabang_domisili || row['Cabang Domisili'] || 'Cabang Jakarta').trim(),
        golongan_darah: String(row.golongan_darah || row['Golongan Darah'] || '').trim(),
        no_kk: String(row.no_kk || row['No KK'] || '').trim(),
        surat_nikah: String(row.surat_nikah || row['Surat Nikah'] || '').trim(),
        email: String(row.email || row['Email'] || '').trim(),
      }));

      // Validate required fields
      const validData = mappedData.filter((item: any) => {
        return item.nik_ktp && item.nama && item.tempat_lahir;
      });

      const invalidCount = mappedData.length - validData.length;

      if (invalidCount > 0) {
        alert(`${invalidCount} baris dilewati karena field tidak lengkap`);
      }

      setImportPreview(validData);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Gagal memparse file Excel. Pastikan format file benar.');
    }
  };

  const handleImport = async () => {
    if (!importFile || importPreview.length === 0) return;

    setImporting(true);
    setImportProgress({ current: 0, total: importPreview.length });

    try {
      const result = await onImport(importPreview);
      alert(`Import selesai! ${result.success} berhasil, ${result.error} gagal`);
      handleClose();
    } catch (error) {
      console.error('Error importing:', error);
      alert('Gagal mengimpor data');
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const downloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');

      // Create template data
      const templateData = [
        {
          'nik_ktp': '3201123456789012',
          'nama': 'Contoh Nama Anggota',
          'tempat_lahir': 'Jakarta',
          'nikap': '19801234',
          'tanggal_lahir': '1960-01-01',
          'status_anggota': 'Aktif',
          'jenis_anggota': 'Pensiunan',
          'status_iuran': 'Lunas',
          'status_kesehatan': 'Sehat',
          'jenis_kelamin': 'Laki-laki',
          'agama': 'Islam',
          'status_perkawinan': 'Menikah',
          'sk_pensiun': 'SKP-12345',
          'nomor_kontak': '08123456789',
          'alamat': 'Jl. Contoh No. 123',
          'rt': '001',
          'rw': '001',
          'kelurahan': 'Contoh',
          'kecamatan': 'Contoh',
          'kota': 'Jakarta',
          'kode_pos': '12345',
          'cabang_domisili': 'Cabang Jakarta',
          'golongan_darah': 'A',
          'no_kk': '1234567890123456',
          'surat_nikah': '123/abc/456',
          'email': 'contoh@email.com'
        }
      ];

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 5 }, { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
        { wch: 8 }, { wch: 20 }, { wch: 5 }, { wch: 20 }, { wch: 15 },
        { wch: 25 },
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      // Generate and download file
      XLSX.writeFile(workbook, 'template_import_anggota.xlsx');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Gagal mengunduh template');
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Import Data Anggota dari Excel
          </DialogTitle>
          <DialogDescription>
            Upload file Excel untuk menambahkan data anggota secara massal
          </DialogDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="mt-2"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template Excel
          </Button>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Klik untuk upload atau drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Excel (.xlsx, .xls) atau CSV
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {importFile && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{importFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(importFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Required Fields Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Field Wajib (Required)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200">nik_ktp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200">nama</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200">tempat_lahir</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Field lain akan diisi dengan nilai default jika tidak ada di Excel
            </p>
          </div>

          {/* Preview Section */}
          {importPreview.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Preview Data ({importPreview.length} baris)</h4>

              {importing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Memproses data...</span>
                    <span className="font-medium">
                      {importProgress.current} / {importProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(importProgress.current / importProgress.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">No</th>
                        <th className="px-3 py-2 text-left font-medium">NIK KTP</th>
                        <th className="px-3 py-2 text-left font-medium">Nama</th>
                        <th className="px-3 py-2 text-left font-medium">Tempat Lahir</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.nik_ktp || '-'}</td>
                          <td className="px-3 py-2">{row.nama || '-'}</td>
                          <td className="px-3 py-2">{row.tempat_lahir || '-'}</td>
                          <td className="px-3 py-2">
                            {row.nik_ktp && row.nama && row.tempat_lahir ? (
                              <Badge variant="success" appearance="ghost" className="text-xs">
                                Valid
                              </Badge>
                            ) : (
                              <Badge variant="destructive" appearance="ghost" className="text-xs">
                                Incomplete
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 10 && (
                    <div className="px-3 py-2 bg-muted text-xs text-center">
                      Menampilkan 10 dari {importPreview.length} baris
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={importing}>
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={!importFile || importPreview.length === 0 || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengimport...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {importPreview.length} Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}