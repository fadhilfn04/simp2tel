import { Fragment, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { DanaSosial, CreateDanaSosialInput, Anggota, JenisBantuan } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge, BadgeDot } from '@/components/ui/badge';

interface DanaSosialFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDanaSosialInput) => Promise<void>;
  claim?: DanaSosial | null;
  mode: 'create' | 'edit';
  isPending: boolean;
  members: Anggota[];
}

export function DanaSosialFormModal({
  open,
  onClose,
  onSubmit,
  claim,
  mode,
  isPending,
  members,
}: DanaSosialFormModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateDanaSosialInput>({
    defaultValues: (claim ? {
      ...claim,
      anggota_id: claim.anggota_id || undefined,
      nikap_pemohon: claim.nikap_pemohon || undefined,
      catatan_review: claim.catatan_review || undefined,
      disetujui_oleh: claim.disetujui_oleh || undefined,
      tanggal_disetujui: claim.tanggal_disetujui || undefined,
      tanggal_penyaluran: claim.tanggal_penyaluran || undefined,
      metode_penyaluran: claim.metode_penyaluran || undefined,
      nama_penerima_dana: claim.nama_penerima_dana || undefined,
      rekening_tujuan: claim.rekening_tujuan || undefined,
      bukti_penyaluran: claim.bukti_penyaluran || undefined,
    } : {
      nama_pemohon: '',
      nikap_pemohon: '',
      hubungan_pemohon: '',
      no_telepon: '',
      jenis_bantuan: 'Lainnya',
      alasan_pengajuan: '',
      jumlah_diajukan: 0,
      status_pengajuan: 'Pending',
      status_penyaluran: 'Belum Disalurkan',
    }) as CreateDanaSosialInput,
  });

  // Auto-populate member data when a member is selected (create mode only)
  useEffect(() => {
    if (mode === 'create' && selectedMemberId) {
      const member = members.find((m) => m.id === selectedMemberId);
      if (member) {
        setValue('nama_pemohon', member.nama_anggota);
        setValue('nikap_pemohon', member.nik);
        setValue('no_telepon', member.nomor_handphone || member.nomor_telepon || '');
      }
    }
  }, [selectedMemberId, mode, members, setValue]);

  // Reset form when modal opens/closes or claim changes
  useEffect(() => {
    if (open) {
      reset((claim ? {
        ...claim,
        anggota_id: claim.anggota_id || undefined,
        nikap_pemohon: claim.nikap_pemohon || undefined,
        catatan_review: claim.catatan_review || undefined,
        disetujui_oleh: claim.disetujui_oleh || undefined,
        tanggal_disetujui: claim.tanggal_disetujui || undefined,
        tanggal_penyaluran: claim.tanggal_penyaluran || undefined,
        metode_penyaluran: claim.metode_penyaluran || undefined,
        nama_penerima_dana: claim.nama_penerima_dana || undefined,
        rekening_tujuan: claim.rekening_tujuan || undefined,
        bukti_penyaluran: claim.bukti_penyaluran || undefined,
      } : {
        nama_pemohon: '',
        nikap_pemohon: '',
        hubungan_pemohon: '',
        no_telepon: '',
        jenis_bantuan: 'Lainnya',
        alasan_pengajuan: '',
        jumlah_diajukan: 0,
        status_pengajuan: 'Pending',
        status_penyaluran: 'Belum Disalurkan',
      }) as CreateDanaSosialInput);
      if (claim?.anggota_id) {
        setSelectedMemberId(claim.anggota_id);
      } else {
        setSelectedMemberId('');
      }
    }
  }, [open, claim, reset]);

  const onFormSubmit = async (data: CreateDanaSosialInput) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error is handled by the parent component
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === 'create' ? 'Ajukan Dana Sosial' : 'Edit Data Dana Sosial'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Lengkapi formulir di bawah ini untuk mengajukan dana sosial'
              : 'Perbarui data dana sosial di bawah ini'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Data Pemohon Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-3">Data Pemohon</h3>
              <div className="border-b border-gray-200 dark:border-gray-700"></div>
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="anggota_id">
                  Pilih Anggota <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedMemberId}
                  onValueChange={(value) => {
                    setSelectedMemberId(value);
                    setValue('anggota_id', value);
                  }}
                >
                  <SelectTrigger id="anggota_id">
                    <SelectValue placeholder="Pilih anggota (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.nama_anggota} - {member.nik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama_pemohon">
                  Nama Pemohon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_pemohon"
                  placeholder="Masukkan nama pemohon"
                  {...register('nama_pemohon', { required: 'Nama pemohon wajib diisi' })}
                />
                {errors.nama_pemohon && (
                  <p className="text-sm text-red-500">{errors.nama_pemohon.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nikap_pemohon">NIKAP</Label>
                <Input
                  id="nikap_pemohon"
                  placeholder="Masukkan NIKAP"
                  {...register('nikap_pemohon')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hubungan_pemohon">
                  Hubungan Pemohon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hubungan_pemohon"
                  placeholder="Contoh: Sendiri, Istri, Suami, Anak"
                  {...register('hubungan_pemohon', { required: 'Hubungan pemohon wajib diisi' })}
                />
                {errors.hubungan_pemohon && (
                  <p className="text-sm text-red-500">{errors.hubungan_pemohon.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_telepon">
                  No. Telepon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="no_telepon"
                  placeholder="Masukkan nomor telepon"
                  {...register('no_telepon', { required: 'Nomor telepon wajib diisi' })}
                />
                {errors.no_telepon && (
                  <p className="text-sm text-red-500">{errors.no_telepon.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detail Dana Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-3">Detail Dana</h3>
              <div className="border-b border-gray-200 dark:border-gray-700"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis_bantuan">
                  Jenis Bantuan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('jenis_bantuan')}
                  onValueChange={(value: JenisBantuan) => setValue('jenis_bantuan', value)}
                >
                  <SelectTrigger id="jenis_bantuan">
                    <SelectValue placeholder="Pilih jenis bantuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medis">Medis</SelectItem>
                    <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="Bencana Alam">Bencana Alam</SelectItem>
                    <SelectItem value="Kematian Keluarga">Kematian Keluarga</SelectItem>
                    <SelectItem value="Jaminan Sosial">Jaminan Sosial</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah_diajukan">
                  Jumlah Diajukan (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jumlah_diajukan"
                  type="number"
                  placeholder="0"
                  {...register('jumlah_diajukan', {
                    required: 'Jumlah diajukan wajib diisi',
                    min: { value: 0, message: 'Jumlah tidak boleh negatif' },
                  })}
                />
                {errors.jumlah_diajukan && (
                  <p className="text-sm text-red-500">{errors.jumlah_diajukan.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan_pengajuan">
                Alasan Pengajuan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="alasan_pengajuan"
                placeholder="Jelaskan alasan pengajuan dana sosial..."
                rows={4}
                {...register('alasan_pengajuan', { required: 'Alasan pengajuan wajib diisi' })}
              />
              {errors.alasan_pengajuan && (
                <p className="text-sm text-red-500">{errors.alasan_pengajuan.message}</p>
              )}
            </div>
          </div>

          {/* Status Section (Edit Mode Only) */}
          {mode === 'edit' && claim && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-3">Status & Penyaluran</h3>
                <div className="border-b border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status_pengajuan">Status Pengajuan</Label>
                  <Select
                    value={watch('status_pengajuan')}
                    onValueChange={(value) => setValue('status_pengajuan', value as any)}
                  >
                    <SelectTrigger id="status_pengajuan">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Dalam Review">Dalam Review</SelectItem>
                      <SelectItem value="Disetujui">Disetujui</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                      <SelectItem value="Disalurkan">Disalurkan</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jumlah_disetujui">Jumlah Disetujui (Rp)</Label>
                  <Input
                    id="jumlah_disetujui"
                    type="number"
                    placeholder="0"
                    {...register('jumlah_disetujui' as any, {
                      min: { value: 0, message: 'Jumlah tidak boleh negatif' },
                    })}
                  />
                  {claim.jumlah_disetujui > 0 && (
                    <p className="text-sm text-gray-500">
                      Saat ini: {formatCurrency(claim.jumlah_disetujui)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status_penyaluran">Status Penyaluran</Label>
                  <Select
                    value={watch('status_penyaluran')}
                    onValueChange={(value) => setValue('status_penyaluran', value as any)}
                  >
                    <SelectTrigger id="status_penyaluran">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Disalurkan">Belum Disalurkan</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Sudah Disalurkan">Sudah Disalurkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metode_penyaluran">Metode Penyaluran</Label>
                  <Input
                    id="metode_penyaluran"
                    placeholder="Contoh: Transfer, Tunai"
                    {...register('metode_penyaluran' as any)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_penerima_dana">Nama Penerima Dana</Label>
                <Input
                  id="nama_penerima_dana"
                  placeholder="Masukkan nama penerima dana"
                  {...register('nama_penerima_dana' as any)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rekening_tujuan">Rekening Tujuan</Label>
                <Input
                  id="rekening_tujuan"
                  placeholder="Masukkan nomor rekening"
                  {...register('rekening_tujuan' as any)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="catatan_review">Catatan Review</Label>
                <Textarea
                  id="catatan_review"
                  placeholder="Tambahkan catatan review..."
                  rows={3}
                  {...register('catatan_review' as any)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : mode === 'create' ? 'Ajukan Dana' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
