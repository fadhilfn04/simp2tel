import { Fragment } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DanaSosial } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, BadgeDot } from '@/components/ui/badge';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  claim: DanaSosial | null;
  isPending: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  claim,
  isPending,
}: DeleteConfirmDialogProps) {
  if (!claim) return null;

  const getStatusProps = (status: DanaSosial['status_pengajuan']) => {
    switch (status) {
      case 'Pending':
        return { variant: 'secondary' as const, label: 'Pending' };
      case 'Dalam Review':
        return { variant: 'info' as const, label: 'Dalam Review' };
      case 'Disetujui':
        return { variant: 'success' as const, label: 'Disetujui' };
      case 'Ditolak':
        return { variant: 'destructive' as const, label: 'Ditolak' };
      case 'Disalurkan':
        return { variant: 'warning' as const, label: 'Disalurkan' };
      case 'Selesai':
        return { variant: 'success' as const, label: 'Selesai' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusProps = getStatusProps(claim.status_pengajuan);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Hapus Dana Sosial
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengajuan dana sosial ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400">Nama Pemohon:</span>
              <span className="text-sm font-medium">{claim.nama_pemohon}</span>
            </div>
            {claim.nikap_pemohon && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500 dark:text-gray-400">NIKAP:</span>
                <span className="text-sm font-medium font-mono">{claim.nikap_pemohon}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400">Jenis Bantuan:</span>
              <span className="text-sm font-medium">{claim.jenis_bantuan}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400">Jumlah:</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(claim.jumlah_diajukan)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <Badge variant={statusProps.variant} appearance="ghost">
                <BadgeDot />
                {statusProps.label}
              </Badge>
            </div>
          </div>

          {(claim.status_pengajuan === 'Disalurkan' || claim.status_pengajuan === 'Selesai') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Perhatian: Dana sosial ini sudah disalurkan atau selesai. Menghapus data ini tidak disarankan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
