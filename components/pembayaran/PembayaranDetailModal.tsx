'use client';

import { Fragment } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { PembayaranSumbangan } from '@/lib/supabase';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  pembayaran: PembayaranSumbangan | null;
}

export function PembayaranDetailModal({ open, onClose, pembayaran }: DetailModalProps) {
  if (!pembayaran) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" appearance="ghost" className="text-xs"><BadgeDot />Sudah Dibayar</Badge>;
      case 'failed':
        return <Badge variant="destructive" appearance="ghost" className="text-xs"><BadgeDot />Gagal</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" appearance="ghost" className="text-xs"><BadgeDot />Pending</Badge>;
    }
  };

  const getTipeSumbanganLabel = (tipe: string) => {
    switch (tipe) {
      case 'sumbangan_bulanan': return 'Sumbangan Bulanan';
      case 'sumbangan_kematian': return 'Sumbangan Kematian';
      case 'sumbangan_khusus': return 'Sumbangan Khusus';
      case 'sumbangan_investasi': return 'Sumbangan Investasi';
      case 'sumbangan_lainnya': return 'Sumbangan Lainnya';
      default: return tipe;
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
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const detailItems = [
    {
      label: 'Nomor Referensi',
      value: pembayaran.nomor_referensi || '-',
      icon: FileText,
    },
    {
      label: 'Nama Anggota',
      value: pembayaran.nama_anggota,
      icon: User,
    },
    {
      label: 'NIK',
      value: pembayaran.nik || '-',
    },
    {
      label: 'Tanggal Transaksi',
      value: formatDate(pembayaran.tanggal_transaksi),
      icon: Calendar,
    },
    {
      label: 'Jumlah Pembayaran',
      value: formatCurrency(pembayaran.jumlah_pembayaran),
      icon: DollarSign,
      highlight: true,
    },
    {
      label: 'Tipe Sumbangan',
      value: getTipeSumbanganLabel(pembayaran.tipe_sumbangan),
    },
    {
      label: 'Status Pembayaran',
      value: getStatusBadge(pembayaran.status_pembayaran),
      icon: pembayaran.status_pembayaran === 'paid' ? CheckCircle : pembayaran.status_pembayaran === 'failed' ? XCircle : Clock,
    },
    {
      label: 'Metode Pembayaran',
      value: pembayaran.metode_pembayaran || '-',
    },
    {
      label: 'Keterangan',
      value: pembayaran.keterangan_pembayaran || '-',
      fullWidth: true,
    },
  ];

  const verificationItems = [
    {
      label: 'Tanggal Verifikasi',
      value: formatDate(pembayaran.tanggal_verifikasi),
      icon: Calendar,
    },
    {
      label: 'Diverifikasi Oleh',
      value: pembayaran.diverifikasi_oleh || '-',
      icon: User,
    },
    {
      label: 'Catatan Verifikasi',
      value: pembayaran.catatan_verifikasi || '-',
      fullWidth: true,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} as={Fragment}>
      <div className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between">
              <DialogTitle className="text-base font-semibold leading-6 text-gray-900">
                Detail Pembayaran Sumbangan
              </DialogTitle>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              {/* Main Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {detailItems.map((item, index) => (
                  <div key={index} className={item.fullWidth ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      {item.label}
                    </label>
                    <div className={`flex items-center gap-2 ${item.highlight ? 'text-lg font-semibold text-green-600' : 'text-gray-900'}`}>
                      {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bukti Pembayaran */}
              {pembayaran.bukti_pembayaran && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Bukti Pembayaran
                  </label>
                  {pembayaran.bukti_pembayaran.endsWith('.jpg') ||
                   pembayaran.bukti_pembayaran.endsWith('.png') ||
                   pembayaran.bukti_pembayaran.endsWith('.jpeg') ||
                   pembayaran.bukti_pembayaran.includes('image') ? (
                    <img
                      src={pembayaran.bukti_pembayaran}
                      alt="Bukti Pembayaran"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  ) : (
                    <a
                      href={pembayaran.bukti_pembayaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Lihat Bukti Pembayaran
                    </a>
                  )}
                </div>
              )}

              {/* Verification Section */}
              {(pembayaran.tanggal_verifikasi || pembayaran.diverifikasi_oleh || pembayaran.catatan_verifikasi ||
                pembayaran.status_pembayaran === 'paid' || pembayaran.status_pembayaran === 'failed') && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Data Verifikasi
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {verificationItems.map((item, index) => (
                      <div key={index} className={item.fullWidth ? 'sm:col-span-2' : ''}>
                        <label className="text-xs font-medium text-gray-500 block mb-1">
                          {item.label}
                        </label>
                        <div className="text-gray-900">
                          {item.icon && <item.icon className="h-4 w-4 text-gray-400 inline mr-2" />}
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div>Dibuat: {formatDate(pembayaran.created_at)}</div>
                {pembayaran.updated_at !== pembayaran.created_at && (
                  <div>Terakhir diperbarui: {formatDate(pembayaran.updated_at)}</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button type="button" onClick={onClose}>
                Tutup
              </Button>
            </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
