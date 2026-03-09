import { useState, useEffect } from 'react';
import { User, FileText, Calendar, MapPin, Phone, Loader2, Plus, Pencil } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DanaKematian, CreateDanaKematianInput } from '@/lib/supabase';

interface DanaKematianFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDanaKematianInput) => Promise<void>;
  claim?: DanaKematian | null;
  mode: 'create' | 'edit';
  isPending: boolean;
  members: DanaKematian[];
}

const defaultFormData: CreateDanaKematianInput = {
  anggota_id: '',
  nama_meninggal: '',
  nik_ktp_meninggal: '',
  nikap_meninggal: '',
  tanggal_meninggal: '',
  tempat_meninggal: '',
  penyebab_meninggal: '',
  no_surat_kematian: '',
  tanggal_surat_kematian: '',
  nama_ahli_waris: '',
  hubungan_ahli_waris: '',
  nik_ktp_ahli_waris: '',
  alamat_ahli_waris: '',
  nomor_kontak_ahli_waris: '',
  jumlah_uang_duka: 0,
  mata_uang: 'IDR',
  status_pengajuan: 'Pending',
  catatan: '',
  metode_pembayaran: 'Transfer',
  no_rekening: '',
  nama_bank: '',
};

export function DanaKematianFormModal({
  open,
  onClose,
  onSubmit,
  claim,
  mode,
  isPending,
  members,
}: DanaKematianFormModalProps) {
  const [formData, setFormData] = useState<CreateDanaKematianInput>(defaultFormData);

  // Reset form when modal opens/closes or claim data changes
  useEffect(() => {
    if (mode === 'edit' && claim) {
      setFormData({
        anggota_id: claim.anggota_id,
        nama_meninggal: claim.nama_meninggal,
        nik_ktp_meninggal: claim.nik_ktp_meninggal,
        nikap_meninggal: claim.nikap_meninggal,
        tanggal_meninggal: claim.tanggal_meninggal,
        tempat_meninggal: claim.tempat_meninggal,
        penyebab_meninggal: claim.penyebab_meninggal || '',
        no_surat_kematian: claim.no_surat_kematian || '',
        tanggal_surat_kematian: claim.tanggal_surat_kematian || '',
        nama_ahli_waris: claim.nama_ahli_waris,
        hubungan_ahli_waris: claim.hubungan_ahli_waris,
        nik_ktp_ahli_waris: claim.nik_ktp_ahli_waris,
        alamat_ahli_waris: claim.alamat_ahli_waris,
        nomor_kontak_ahli_waris: claim.nomor_kontak_ahli_waris,
        jumlah_uang_duka: claim.jumlah_uang_duka,
        mata_uang: claim.mata_uang,
        status_pengajuan: claim.status_pengajuan,
        catatan: claim.catatan || '',
        metode_pembayaran: claim.metode_pembayaran || 'Transfer',
        no_rekening: claim.no_rekening || '',
        nama_bank: claim.nama_bank || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [claim, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member && mode === 'create') {
      setFormData({
        ...formData,
        anggota_id: memberId,
        nama_meninggal: member.nama,
        nik_ktp_meninggal: member.nik_ktp,
        nikap_meninggal: member.nikap,
      });
    }
  };

  const title = mode === 'create' ? 'Ajukan Dana Kematian Baru' : 'Edit Data Dana Kematian';
  const description = mode === 'create'
    ? 'Isi formulir di bawah ini untuk mengajukan dana kematian'
    : 'Ubah data pengajuan dana kematian';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Data Meninggal Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Data Meninggal
              </h3>

              {mode === 'create' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pilih Anggota *</label>
                    <Select
                      value={formData.anggota_id}
                      onValueChange={handleMemberSelect}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih anggota yang meninggal" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.nama} - {member.nikap}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Meninggal *</label>
                  <Input
                    placeholder="Nama lengkap yang meninggal"
                    value={formData.nama_meninggal}
                    onChange={(e) => setFormData({ ...formData, nama_meninggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIK KTP *</label>
                  <Input
                    placeholder="NIK KTP yang meninggal"
                    value={formData.nik_ktp_meninggal}
                    onChange={(e) => setFormData({ ...formData, nik_ktp_meninggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIKAP *</label>
                  <Input
                    placeholder="NIKAP yang meninggal"
                    value={formData.nikap_meninggal}
                    onChange={(e) => setFormData({ ...formData, nikap_meninggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Meninggal *</label>
                  <Input
                    type="date"
                    value={formData.tanggal_meninggal}
                    onChange={(e) => setFormData({ ...formData, tanggal_meninggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempat Meninggal *</label>
                  <Input
                    placeholder="Tempat meninggal"
                    value={formData.tempat_meninggal}
                    onChange={(e) => setFormData({ ...formData, tempat_meninggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Penyebab Meninggal</label>
                  <Input
                    placeholder="Penyebab meninggal"
                    value={formData.penyebab_meninggal}
                    onChange={(e) => setFormData({ ...formData, penyebab_meninggal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. Surat Kematian</label>
                  <Input
                    placeholder="Nomor surat kematian"
                    value={formData.no_surat_kematian}
                    onChange={(e) => setFormData({ ...formData, no_surat_kematian: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Surat Kematian</label>
                  <Input
                    type="date"
                    value={formData.tanggal_surat_kematian}
                    onChange={(e) => setFormData({ ...formData, tanggal_surat_kematian: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Data Ahli Waris Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Data Ahli Waris
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Ahli Waris *</label>
                  <Input
                    placeholder="Nama lengkap ahli waris"
                    value={formData.nama_ahli_waris}
                    onChange={(e) => setFormData({ ...formData, nama_ahli_waris: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hubungan Ahli Waris *</label>
                  <Select
                    value={formData.hubungan_ahli_waris}
                    onValueChange={(value) => setFormData({ ...formData, hubungan_ahli_waris: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Istri/Suami">Istri/Suami</SelectItem>
                      <SelectItem value="Anak">Anak</SelectItem>
                      <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                      <SelectItem value="Saudara">Saudara</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIK KTP Ahli Waris *</label>
                  <Input
                    placeholder="NIK KTP ahli waris"
                    value={formData.nik_ktp_ahli_waris}
                    onChange={(e) => setFormData({ ...formData, nik_ktp_ahli_waris: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nomor Kontak Ahli Waris *</label>
                  <Input
                    placeholder="Nomor kontak"
                    value={formData.nomor_kontak_ahli_waris}
                    onChange={(e) => setFormData({ ...formData, nomor_kontak_ahli_waris: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Alamat Ahli Waris *</label>
                  <Input
                    placeholder="Alamat lengkap ahli waris"
                    value={formData.alamat_ahli_waris}
                    onChange={(e) => setFormData({ ...formData, alamat_ahli_waris: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Detail Dana Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Dana
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Uang Duka (Rupiah) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.jumlah_uang_duka}
                    onChange={(e) => setFormData({ ...formData, jumlah_uang_duka: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Pengajuan *</label>
                  <Select
                    value={formData.status_pengajuan}
                    onValueChange={(value) => setFormData({ ...formData, status_pengajuan: value as any })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Disetujui">Disetujui</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                      <SelectItem value="Dibayar">Dibayar</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metode Pembayaran *</label>
                  <Select
                    value={formData.metode_pembayaran}
                    onValueChange={(value) => setFormData({ ...formData, metode_pembayaran: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transfer">Transfer Bank</SelectItem>
                      <SelectItem value="Tunai">Tunai</SelectItem>
                      <SelectItem value="Cek">Cek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Bank</label>
                  <Input
                    placeholder="Nama bank"
                    value={formData.nama_bank}
                    onChange={(e) => setFormData({ ...formData, nama_bank: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nomor Rekening</label>
                  <Input
                    placeholder="Nomor rekening"
                    value={formData.no_rekening}
                    onChange={(e) => setFormData({ ...formData, no_rekening: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Catatan</label>
                  <Input
                    placeholder="Catatan tambahan"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              * Field wajib diisi
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajukan Dana
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update Data
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}