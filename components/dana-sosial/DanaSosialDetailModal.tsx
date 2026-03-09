import { Fragment } from 'react';
import { X, Calendar, User, Phone, FileText, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { DanaSosial } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, BadgeDot } from '@/components/ui/badge';

interface DanaSosialDetailModalProps {
  open: boolean;
  onClose: () => void;
  claim: DanaSosial | null;
}

export function DanaSosialDetailModal({ open, onClose, claim }: DanaSosialDetailModalProps) {
  if (!claim) return null;

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

  const getStatusProps = (status: DanaSosial['status_pengajuan']) => {
    switch (status) {
      case 'Pending':
        return { variant: 'secondary' as const, label: 'Pending', icon: Clock };
      case 'Dalam Review':
        return { variant: 'info' as const, label: 'Dalam Review', icon: Clock };
      case 'Disetujui':
        return { variant: 'success' as const, label: 'Disetujui', icon: CheckCircle };
      case 'Ditolak':
        return { variant: 'destructive' as const, label: 'Ditolak', icon: XCircle };
      case 'Disalurkan':
        return { variant: 'warning' as const, label: 'Disalurkan', icon: CheckCircle };
      case 'Selesai':
        return { variant: 'success' as const, label: 'Selesai', icon: CheckCircle };
      default:
        return { variant: 'secondary' as const, label: status, icon: Clock };
    }
  };

  const getPenyaluranProps = (status: DanaSosial['status_penyaluran']) => {
    switch (status) {
      case 'Belum Disalurkan':
        return { variant: 'secondary' as const, label: 'Belum Disalurkan' };
      case 'Dalam Proses':
        return { variant: 'info' as const, label: 'Dalam Proses' };
      case 'Sudah Disalurkan':
        return { variant: 'success' as const, label: 'Sudah Disalurkan' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const statusProps = getStatusProps(claim.status_pengajuan);
  const penyaluranProps = getPenyaluranProps(claim.status_penyaluran);
  const StatusIcon = statusProps.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Detail Dana Sosial</DialogTitle>
              <DialogDescription className="mt-1">
                Informasi lengkap mengenai pengajuan dana sosial
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Status Pengajuan</h3>
              <Badge variant={statusProps.variant} appearance="ghost">
                <BadgeDot />
                {statusProps.label}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Tanggal Pengajuan</p>
                <p className="font-medium">{formatDate(claim.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status Penyaluran</p>
                <p className="font-medium">
                  <Badge variant={penyaluranProps.variant} appearance="ghost">
                    <BadgeDot />
                    {penyaluranProps.label}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Jumlah Diajukan</p>
                <p className="font-medium text-green-600">{formatCurrency(claim.jumlah_diajukan)}</p>
              </div>
            </div>
          </div>

          {/* Data Pemohon */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Data Pemohon
            </h3>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nama Pemohon</p>
                  <p className="font-medium">{claim.nama_pemohon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">NIKAP</p>
                  <p className="font-medium">{claim.nikap_pemohon || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hubungan Pemohon</p>
                  <p className="font-medium">{claim.hubungan_pemohon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No. Telepon</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {claim.no_telepon}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Dana */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detail Dana
            </h3>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jenis Bantuan</p>
                  <p className="font-medium">
                    <Badge variant="secondary" appearance="ghost">
                      {claim.jenis_bantuan}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jumlah Disetujui</p>
                  <p className="font-medium text-green-600">
                    {claim.jumlah_disetujui > 0 ? formatCurrency(claim.jumlah_disetujui) : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alasan Pengajuan</p>
                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  {claim.alasan_pengajuan}
                </p>
              </div>
            </div>
          </div>

          {/* Informasi Penyaluran */}
          {(claim.status_pengajuan === 'Disalurkan' || claim.status_pengajuan === 'Selesai' ||
            claim.status_penyaluran !== 'Belum Disalurkan') && (
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Informasi Penyaluran
              </h3>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Metode Penyaluran</p>
                    <p className="font-medium">{claim.metode_penyaluran || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Penyaluran</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(claim.tanggal_penyaluran)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nama Penerima Dana</p>
                    <p className="font-medium">{claim.nama_penerima_dana || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rekening Tujuan</p>
                    <p className="font-medium font-mono">{claim.rekening_tujuan || '-'}</p>
                  </div>
                </div>
                {claim.disetujui_oleh && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Disetujui Oleh</p>
                    <p className="font-medium">{claim.disetujui_oleh}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Catatan Review */}
          {claim.catatan_review && (
            <div>
              <h3 className="text-base font-semibold mb-3">Catatan Review</h3>
              <div className="border rounded-lg p-4">
                <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  {claim.catatan_review}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>Dibuat: {formatDate(claim.created_at)}</p>
              </div>
              <div>
                <p>Diperbarui: {formatDate(claim.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
