import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
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
import { DanaKematian } from '@/lib/supabase';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  claim: DanaKematian | null;
  isPending: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  claim,
  isPending,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Konfirmasi Hapus
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengajuan dana kematian ini?
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {claim && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nama Meninggal</span>
                <span className="font-medium">{claim.nama_meninggal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NIKAP</span>
                <span className="font-mono text-sm">{claim.nikap_meninggal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ahli Waris</span>
                <span className="text-sm">{claim.nama_ahli_waris}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm">{claim.status_pengajuan}</span>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari sistem.
          </p>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}