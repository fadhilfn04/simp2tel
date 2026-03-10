import { User, FileText, Calendar, MapPin, Phone, DollarSign, Building, CheckCircle } from 'lucide-react';
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
import { Badge, BadgeDot } from '@/components/ui/badge';
import { DanaKematian } from '@/lib/supabase';

interface DanaKematianDetailModalProps {
  open: boolean;
  onClose: () => void;
  claim: DanaKematian | null;
}

interface StatusProps {
  variant: 'success' | 'warning' | 'destructive' | 'secondary';
  label: string;
}

export function DanaKematianDetailModal({ open, onClose, claim }: DanaKematianDetailModalProps) {
  if (!claim) return null;

  const getStatusProsesProps = (status: DanaKematian['status_proses']): StatusProps => {
    switch (status) {
      case 'dilaporkan':
        return { variant: 'secondary', label: 'Dilaporkan' };
      case 'verifikasi_cabang':
        return { variant: 'warning', label: 'Verifikasi Cabang' };
      case 'proses_pusat':
        return { variant: 'warning', label: 'Proses Pusat' };
      case 'selesai':
        return { variant: 'success', label: 'Selesai' };
      default:
        return { variant: 'secondary', label: status };
    }
  };

  const getAhliWarisLabel = (status: DanaKematian['status_ahli_waris']) => {
    const statusMap: Record<string, string> = {
      istri: 'Istri',
      suami: 'Suami',
      anak: 'Anak',
      keluarga: 'Keluarga',
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detail Dana Kematian</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai pengajuan dana kematian
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Status Proses</div>
              <Badge variant={getStatusProsesProps(claim.status_proses).variant} appearance="ghost">
                <BadgeDot />
                {getStatusProsesProps(claim.status_proses).label}
              </Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Besaran Dana</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(claim.besaran_dana_kematian)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Tanggal Meninggal</div>
              <div className="text-sm">{formatDate(claim.tanggal_meninggal)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Cabang Pelapor</div>
              <div className="text-sm">{claim.cabang_asal_melapor}</div>
            </div>
          </div>

          {/* Data Anggota */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Data Anggota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Nama Anggota</label>
                <div className="font-medium">{claim.nama_anggota}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status Anggota</label>
                <div className="text-sm capitalize">{claim.status_anggota.replace('_', ' ')}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status MPS</label>
                <div className="text-sm">{claim.status_mps === 'mps' ? 'MPS' : 'Non-MPS'}</div>
              </div>
            </div>
          </div>

          {/* Data Kematian */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Data Kematian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Meninggal</label>
                <div className="text-sm">{formatDate(claim.tanggal_meninggal)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Penyebab Meninggal</label>
                <div className="text-sm">{claim.penyebab_meninggal || '-'}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Lapor Keluarga</label>
                <div className="text-sm">{formatDate(claim.tanggal_lapor_keluarga)}</div>
              </div>
            </div>
          </div>

          {/* Data Pelaporan */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Pelaporan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Cabang Asal Melapor</label>
                <div className="text-sm">{claim.cabang_asal_melapor}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Nama Pelapor</label>
                <div className="text-sm">{claim.cabang_nama_pelapor || '-'}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">NIK Pelapor</label>
                <div className="text-sm font-mono">{claim.cabang_nik_pelapor || '-'}</div>
              </div>
            </div>
          </div>

          {/* Proses Cabang */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Proses Cabang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Terima Berkas</label>
                <div className="text-sm">{formatDate(claim.cabang_tanggal_awal_terima_berkas)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Kirim ke Pusat</label>
                <div className="text-sm">{formatDate(claim.cabang_tanggal_kirim_ke_pusat)}</div>
              </div>
            </div>
          </div>

          {/* Proses Pusat */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Proses Pusat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Terima</label>
                <div className="text-sm">{formatDate(claim.pusat_tanggal_awal_terima)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Validasi</label>
                <div className="text-sm">{formatDate(claim.pusat_tanggal_validasi)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Selesai</label>
                <div className="text-sm">{formatDate(claim.pusat_tanggal_selesai)}</div>
              </div>
            </div>
          </div>

          {/* Dana Kematian */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dana Kematian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Besaran Dana Kematian</label>
                <div className="text-sm font-semibold text-green-600">{formatCurrency(claim.besaran_dana_kematian)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Serah ke Ahli Waris</label>
                <div className="text-sm">{formatDate(claim.cabang_tanggal_serah_ke_ahli_waris)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Lapor ke Pusat</label>
                <div className="text-sm">{formatDate(claim.cabang_tanggal_lapor_ke_pusat)}</div>
              </div>
            </div>
          </div>

          {/* Data Ahli Waris */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Data Ahli Waris
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Nama Ahli Waris</label>
                <div className="font-medium">{claim.nama_ahli_waris}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status Ahli Waris</label>
                <div className="text-sm">{getAhliWarisLabel(claim.status_ahli_waris)}</div>
              </div>
            </div>
          </div>

          {/* File Dokumen */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File Dokumen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">File SK Pensiun</label>
                <div className="text-sm">
                  {claim.file_sk_pensiun ? (
                    <a href={claim.file_sk_pensiun} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Surat Kematian</label>
                <div className="text-sm">
                  {claim.file_surat_kematian ? (
                    <a href={claim.file_surat_kematian} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Surat Pernyataan Ahli Waris</label>
                <div className="text-sm">
                  {claim.file_surat_pernyataan_ahli_waris ? (
                    <a href={claim.file_surat_pernyataan_ahli_waris} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Kartu Keluarga</label>
                <div className="text-sm">
                  {claim.file_kartu_keluarga ? (
                    <a href={claim.file_kartu_keluarga} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File E-KTP</label>
                <div className="text-sm">
                  {claim.file_e_ktp ? (
                    <a href={claim.file_e_ktp} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Surat Nikah</label>
                <div className="text-sm">
                  {claim.file_surat_nikah ? (
                    <a href={claim.file_surat_nikah} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat File
                    </a>
                  ) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          {claim.keterangan && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Keterangan
              </h3>
              <div className="text-sm bg-muted/50 rounded-lg p-4">
                {claim.keterangan}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
