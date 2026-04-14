'use client';

import { Fragment, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PembayaranSumbangan } from '@/lib/supabase';

interface VerifyModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (data: { status_pembayaran: 'paid' | 'failed'; diverifikasi_oleh: string; catatan_verifikasi?: string }) => Promise<void>;
  pembayaran: PembayaranSumbangan | null;
  isPending?: boolean;
  userName?: string;
}

export function PembayaranVerifyModal({
  open,
  onClose,
  onVerify,
  pembayaran,
  isPending,
  userName = '',
}: VerifyModalProps) {
  const [verifyStatus, setVerifyStatus] = useState<'paid' | 'failed' | null>(null);
  const [catatan, setCatatan] = useState('');

  const handleClose = () => {
    setVerifyStatus(null);
    setCatatan('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!verifyStatus) return;

    try {
      await onVerify({
        status_pembayaran: verifyStatus,
        diverifikasi_oleh: userName,
        catatan_verifikasi: catatan || undefined,
      });
      handleClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  if (!pembayaran) return null;

  return (
    <Dialog open={open} onClose={handleClose} as={Fragment}>
      <div className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between">
              <DialogTitle className="text-base font-semibold leading-6 text-gray-900">
                Verifikasi Pembayaran
              </DialogTitle>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{pembayaran.nama_anggota}</div>
                  <div className="mt-1">{pembayaran.nik}</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">
                    Rp {pembayaran.jumlah_pembayaran.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{pembayaran.tipe_sumbangan.replace(/_/g, ' ')}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Status Verifikasi <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setVerifyStatus('paid')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                        verifyStatus === 'paid'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle className={`h-8 w-8 ${verifyStatus === 'paid' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${verifyStatus === 'paid' ? 'text-green-700' : 'text-gray-600'}`}>
                        Setujui
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifyStatus('failed')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                        verifyStatus === 'failed'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <XCircle className={`h-8 w-8 ${verifyStatus === 'failed' ? 'text-red-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${verifyStatus === 'failed' ? 'text-red-700' : 'text-gray-600'}`}>
                        Tolak
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="catatan">Catatan Verifikasi</Label>
                  <Textarea
                    id="catatan"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tambahkan catatan verifikasi..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!verifyStatus || isPending}
                className={verifyStatus === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : verifyStatus === 'paid' ? (
                  'Setujui Pembayaran'
                ) : (
                  'Tolak Pembayaran'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Batal
              </Button>
            </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
