import { User, FileText, Calendar, MapPin, Phone, Money } from 'lucide-react';
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
  variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info';
  label: string;
}

export function DanaKematianDetailModal({ open, onClose, claim }: DanaKematianDetailModalProps) {
  if (!claim) return null;

  const getStatusProps = (status: DanaKematian['status_pengajuan']): StatusProps => {
    switch (status) {
      case 'Pending':
        return { variant: 'secondary', label: 'Pending' };
      case 'Dalam Proses':
        return { variant: 'info', label: 'Dalam Proses' };
      case 'Disetujui':
        return { variant: 'success', label: 'Disetujui' };
      case 'Ditolak':
        return { variant: 'destructive', label: 'Ditolak' };
      case 'Dibayar':
        return { variant: 'warning', label: 'Dibayar' };
      case 'Selesai':
        return { variant: 'success', label: 'Selesai' };
      default:
        return { variant: 'secondary', label: status };
    }
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
              <div className="text-sm text-muted-foreground mb-1">Status Pengajuan</div>
              <Badge variant={getStatusProps(claim.status_pengajuan).variant} appearance="ghost">
                <BadgeDot />
                {getStatusProps(claim.status_pengajuan).label}
              </Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Jumlah Dana</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(claim.jumlah_uang_duka)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Tanggal Pengajuan</div>
              <div className="text-sm">{formatDate(claim.tanggal_pengajuan)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Metode Pembayaran</div>
              <div className="text-sm">{claim.metode_pembayaran || '-'}</div>
            </div>
          </div>

          {/* Data Meninggal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Data Meninggal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Nama Meninggal</label>
                <div className="font-medium">{claim.nama_meninggal}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">NIK KTP</label>
                <div className="font-mono text-sm">{claim.nik_ktp_meninggal}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">NIKAP</label>
                <div className="font-mono text-sm">{claim.nikap_meninggal}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Meninggal</label>
                <div className="text-sm">{formatDate(claim.tanggal_meninggal)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tempat Meninggal</label>
                <div className="text-sm">{claim.tempat_meninggal}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Penyebab Meninggal</label>
                <div className="text-sm">{claim.penyebab_meninggal || '-'}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">No. Surat Kematian</label>
                <div className="text-sm">{claim.no_surat_kematian || '-'}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Surat</label>
                <div className="text-sm">{formatDate(claim.tanggal_surat_kematian)}</div>
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
                <label className="text-sm text-muted-foreground">Hubungan</label>
                <div className="text-sm">{claim.hubungan_ahli_waris}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">NIK KTP Ahli Waris</label>
                <div className="font-mono text-sm">{claim.nik_ktp_ahli_waris}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Nomor Kontak</label>
                <div className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {claim.nomor_kontak_ahli_waris}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Alamat Ahli Waris</label>
                <div className="text-sm">{claim.alamat_ahli_waris}</div>
              </div>
            </div>
          </div>

          {/* Informasi Pembayaran */}
          {(claim.tanggal_persetujuan || claim.tanggal_pembayaran) && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Pembayaran
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claim.tanggal_persetujuan && (
                  <div>
                    <label className="text-sm text-muted-foreground">Tanggal Persetujuan</label>
                    <div className="text-sm">{formatDate(claim.tanggal_persetujuan)}</div>
                  </div>
                )}
                {claim.tanggal_pembayaran && (
                  <div>
                    <label className="text-sm text-muted-foreground">Tanggal Pembayaran</label>
                    <div className="text-sm">{formatDate(claim.tanggal_pembayaran)}</div>
                  </div>
                )}
                {claim.disetujui_oleh && (
                  <div>
                    <label className="text-sm text-muted-foreground">Disetujui Oleh</label>
                    <div className="text-sm">{claim.disetujui_oleh}</div>
                  </div>
                )}
                {claim.no_rekening && (
                  <div>
                    <label className="text-sm text-muted-foreground">No. Rekening</label>
                    <div className="text-sm">{claim.no_rekening}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Catatan */}
          {claim.catatan && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Catatan
              </h3>
              <div className="text-sm bg-muted/50 rounded-lg p-4">
                {claim.catatan}
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