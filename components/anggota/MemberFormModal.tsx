import { useState, useEffect } from 'react';
import { User, FileText, MapPin, Loader2, Pencil, Plus } from 'lucide-react';
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
import { Anggota, CreateAnggotaInput } from '@/lib/supabase';

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnggotaInput) => Promise<void>;
  member?: Anggota | null;
  mode: 'create' | 'edit';
  isPending: boolean;
}

const defaultFormData: CreateAnggotaInput = {
  nikap: '',
  nik_ktp: '',
  nama: '',
  status_anggota: 'Aktif',
  jenis_anggota: 'Pensiunan',
  status_iuran: 'Lunas',
  status_kesehatan: 'Sehat',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'Laki-laki',
  agama: 'Islam',
  golongan_darah: '',
  status_perkawinan: 'Menikah',
  no_kk: '',
  surat_nikah: '',
  sk_pensiun: '',
  nomor_kontak: '',
  alamat: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  kode_pos: '',
  cabang_domisili: '',
};

export function MemberFormModal({
  open,
  onClose,
  onSubmit,
  member,
  mode,
  isPending,
}: MemberFormModalProps) {
  const [formData, setFormData] = useState<CreateAnggotaInput>(defaultFormData);

  // Reset form when modal opens/closes or member data changes
  useEffect(() => {
    if (mode === 'edit' && member) {
      setFormData({
        nikap: member.nikap,
        nik_ktp: member.nik_ktp,
        nama: member.nama,
        status_anggota: member.status_anggota,
        jenis_anggota: member.jenis_anggota,
        status_iuran: member.status_iuran,
        status_kesehatan: member.status_kesehatan,
        tempat_lahir: member.tempat_lahir,
        tanggal_lahir: member.tanggal_lahir,
        jenis_kelamin: member.jenis_kelamin,
        agama: member.agama,
        golongan_darah: member.golongan_darah || '',
        status_perkawinan: member.status_perkawinan,
        no_kk: member.no_kk || '',
        surat_nikah: member.surat_nikah || '',
        sk_pensiun: member.sk_pensiun,
        nomor_kontak: member.nomor_kontak,
        email: member.email || '',
        alamat: member.alamat,
        rt: member.rt,
        rw: member.rw,
        kelurahan: member.kelurahan,
        kecamatan: member.kecamatan,
        kota: member.kota,
        kode_pos: member.kode_pos,
        cabang_domisili: member.cabang_domisili,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [member, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const title = mode === 'create' ? 'Tambah Anggota Baru' : 'Edit Data Anggota';
  const description = mode === 'create'
    ? 'Isi formulir di bawah ini untuk menambahkan anggota pensiunan baru'
    : 'Ubah data anggota pensiunan';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Anggota *</label>
                <Select
                  value={formData.status_anggota}
                  onValueChange={(value) => setFormData({ ...formData, status_anggota: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Non-Aktif">Non-Aktif</SelectItem>
                    <SelectItem value="Meninggal">Meninggal</SelectItem>
                    <SelectItem value="Pindah">Pindah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Anggota *</label>
                <Select
                  value={formData.jenis_anggota}
                  onValueChange={(value) => setFormData({ ...formData, jenis_anggota: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pensiunan">Pensiunan</SelectItem>
                    <SelectItem value="Janda/Duda">Janda/Duda</SelectItem>
                    <SelectItem value="Tanggungan">Tanggungan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Iuran *</label>
                <Select
                  value={formData.status_iuran}
                  onValueChange={(value) => setFormData({ ...formData, status_iuran: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status iuran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunas">Lunas</SelectItem>
                    <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
                    <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informasi Pribadi */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIKAP *</label>
                  <Input
                    placeholder="Contoh: 19801234"
                    value={formData.nikap}
                    onChange={(e) => setFormData({ ...formData, nikap: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIK KTP *</label>
                  <Input
                    placeholder="Contoh: 3201123456789012"
                    value={formData.nik_ktp}
                    onChange={(e) => setFormData({ ...formData, nik_ktp: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Lengkap *</label>
                  <Input
                    placeholder="Nama lengkap anggota"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempat Lahir *</label>
                  <Input
                    placeholder="Kota kelahiran"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Lahir *</label>
                  <Input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Kelamin *</label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agama *</label>
                  <Select
                    value={formData.agama}
                    onValueChange={(value) => setFormData({ ...formData, agama: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Kristen">Kristen</SelectItem>
                      <SelectItem value="Katolik">Katolik</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddha">Buddha</SelectItem>
                      <SelectItem value="Konghucu">Konghucu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Golongan Darah</label>
                  <Select
                    value={formData.golongan_darah}
                    onValueChange={(value) => setFormData({ ...formData, golongan_darah: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih golongan darah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                      <SelectItem value="-">Tidak Tahu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Perkawinan *</label>
                  <Select
                    value={formData.status_perkawinan}
                    onValueChange={(value) => setFormData({ ...formData, status_perkawinan: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menikah">Menikah</SelectItem>
                      <SelectItem value="Duda">Duda</SelectItem>
                      <SelectItem value="Janda">Janda</SelectItem>
                      <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Informasi Kesehatan & Keanggotaan */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Kesehatan & Keanggotaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Kesehatan *</label>
                  <Select
                    value={formData.status_kesehatan}
                    onValueChange={(value) => setFormData({ ...formData, status_kesehatan: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status kesehatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sehat">Sehat</SelectItem>
                      <SelectItem value="BPJS">BPJS</SelectItem>
                      <SelectItem value="Asuransi Swasta">Asuransi Swasta</SelectItem>
                      <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. Kartu Keluarga *</label>
                  <Input
                    placeholder="Nomor KK"
                    value={formData.no_kk}
                    onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Surat Nikah</label>
                  <Input
                    placeholder="Nomor surat nikah (jika ada)"
                    value={formData.surat_nikah}
                    onChange={(e) => setFormData({ ...formData, surat_nikah: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SK Pensiun *</label>
                  <Input
                    placeholder="Nomor SK pensiun"
                    value={formData.sk_pensiun}
                    onChange={(e) => setFormData({ ...formData, sk_pensiun: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cabang Domisili *</label>
                  <Select
                    value={formData.cabang_domisili}
                    onValueChange={(value) => setFormData({ ...formData, cabang_domisili: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cabang Jakarta">Cabang Jakarta</SelectItem>
                      <SelectItem value="Cabang Bandung">Cabang Bandung</SelectItem>
                      <SelectItem value="Cabang Surabaya">Cabang Surabaya</SelectItem>
                      <SelectItem value="Cabang Medan">Cabang Medan</SelectItem>
                      <SelectItem value="Cabang Makassar">Cabang Makassar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Kontak & Alamat */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Kontak & Alamat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nomor Kontak *</label>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={formData.nomor_kontak}
                    onChange={(e) => setFormData({ ...formData, nomor_kontak: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Alamat *</label>
                  <Input
                    placeholder="Jalan, RT, RW"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">RT *</label>
                  <Input
                    placeholder="001"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">RW *</label>
                  <Input
                    placeholder="001"
                    value={formData.rw}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kelurahan *</label>
                  <Input
                    placeholder="Nama kelurahan"
                    value={formData.kelurahan}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kecamatan *</label>
                  <Input
                    placeholder="Nama kecamatan"
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kota *</label>
                  <Input
                    placeholder="Nama kota"
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kode Pos *</label>
                  <Input
                    placeholder="12345"
                    value={formData.kode_pos}
                    onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                    required
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
                      Simpan Anggota
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