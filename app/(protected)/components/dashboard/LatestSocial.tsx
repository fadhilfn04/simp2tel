import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Heart, DollarSign, Calendar, User } from 'lucide-react';
import { DanaSosial } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LatestSocialProps {
  social: DanaSosial[];
  isLoading: boolean;
}

export function LatestSocial({ social, isLoading }: LatestSocialProps) {
  const getStatusProps = (status: DanaSosial['status_pengajuan']) => {
    switch (status) {
      case 'Pending':
        return { variant: 'secondary' as const, label: 'Pending' };
      case 'Dalam Review':
        return { variant: 'info' as const, label: 'Review' };
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dana Sosial Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!social || social.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dana Sosial Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data dana sosial
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Dana Sosial Terbaru
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/pelayanan/dana-sosial">Lihat Semua</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pemohon</TableHead>
                <TableHead>Jenis Bantuan</TableHead>
                <TableHead>Jumlah Diajukan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {social.map((item) => {
                const statusProps = getStatusProps(item.status_pengajuan);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{item.nama_pemohon}</span>
                        </div>
                        {item.nikap_pemohon && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.nikap_pemohon}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {item.hubungan_pemohon}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" appearance="ghost">
                        {item.jenis_bantuan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(item.jumlah_diajukan)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusProps.variant} appearance="ghost">
                        <BadgeDot />
                        {statusProps.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
