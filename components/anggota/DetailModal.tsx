import { User, FileText, MapPin, Phone, Mail } from 'lucide-react';
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
import { Anggota } from '@/lib/supabase';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  member: Anggota | null;
}

interface StatusProps {
  variant: 'success' | 'warning' | 'destructive' | 'secondary';
  label: string;
}

export function DetailModal({ open, onClose, member }: DetailModalProps) {
  if (!member) return null;

  const getStatusAnggotaProps = (status: Anggota['status_anggota']): StatusProps => {
    switch (status) {
      case 'Aktif':
        return { variant: 'success', label: 'Aktif' };
      case 'Non-Aktif':
        return { variant: 'destructive', label: 'Non-Aktif' };
      case 'Meninggal':
        return { variant: 'destructive', label: 'Meninggal' };
      case 'Pindah':
        return { variant: 'warning', label: 'Pindah' };
      default:
        return { variant: 'secondary', label: status };
    }
  };

  const getStatusIuranProps = (status: Anggota['status_iuran']): StatusProps => {
    switch (status) {
      case 'Lunas':
        return { variant: 'success', label: 'Lunas' };
      case 'Belum Lunas':
        return { variant: 'warning', label: 'Belum Lunas' };
      case 'Tidak Ada':
        return { variant: 'secondary', label: 'Tidak Ada' };
      default:
        return { variant: 'secondary', label: status };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detail Anggota</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai data anggota pensiunan
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Status Anggota</div>
              <Badge variant={getStatusAnggotaProps(member.status_anggota).variant} appearance="ghost">
                <BadgeDot />
                {getStatusAnggotaProps(member.status_anggota).label}
              </Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Status Iuran</div>
              <Badge variant={getStatusIuranProps(member.status_iuran).variant} appearance="ghost">
                <BadgeDot />
                {getStatusIuranProps(member.status_iuran).label}
              </Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Jenis Anggota</div>
              <div className="font-medium">{member.jenis_anggota}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Cabang</div>
              <div className="font-medium text-sm">{member.cabang_domisili}</div>
            </div>
          </div>

          {/* Informasi Pribadi */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">NIKAP</label>
                <div className="font-mono text-sm font-medium">{member.nikap}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">NIK KTP</label>
                <div className="font-mono text-sm font-medium">{member.nik_ktp}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Nama Lengkap</label>
                <div className="font-medium">{member.nama}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tempat Lahir</label>
                <div className="text-sm">{member.tempat_lahir}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Lahir</label>
                <div className="text-sm">{member.tanggal_lahir}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Jenis Kelamin</label>
                <div className="text-sm">{member.jenis_kelamin}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Agama</label>
                <div className="text-sm">{member.agama}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Golongan Darah</label>
                <div className="text-sm">{member.golongan_darah}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status Perkawinan</label>
                <div className="text-sm">{member.status_perkawinan}</div>
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
              <div>
                <label className="text-sm text-muted-foreground">Status Kesehatan</label>
                <div className="text-sm">{member.status_kesehatan}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">No. Kartu Keluarga</label>
                <div className="font-mono text-sm">{member.no_kk}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Surat Nikah</label>
                <div className="text-sm">{member.surat_nikah}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">SK Pensiun</label>
                <div className="text-sm">{member.sk_pensiun}</div>
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
              <div>
                <label className="text-sm text-muted-foreground">Nomor Kontak</label>
                <div className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {member.nomor_kontak}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Alamat Lengkap</label>
                <div className="text-sm">
                  {member.alamat}, RT {member.rt}/RW {member.rw},
                  Kel. {member.kelurahan}, Kec. {member.kecamatan},
                  {member.kota} {member.kode_pos}
                </div>
              </div>
            </div>
          </div>
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