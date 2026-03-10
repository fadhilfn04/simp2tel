import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { FileText, DollarSign, Calendar, User } from 'lucide-react';
import { DanaKematian } from '@/lib/supabase';
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

interface LatestClaimsProps {
  claims: DanaKematian[];
  isLoading: boolean;
}

export function LatestClaims({ claims, isLoading }: LatestClaimsProps) {
  const getStatusProps = (status: DanaKematian['status_proses']) => {
    switch (status) {
      case 'dilaporkan':
        return { variant: 'secondary' as const, label: 'Dilaporkan' };
      case 'verifikasi_cabang':
        return { variant: 'info' as const, label: 'Verifikasi Cabang' };
      case 'proses_pusat':
        return { variant: 'warning' as const, label: 'Proses Pusat' };
      case 'selesai':
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
            <FileText className="h-5 w-5" />
            Klaim Dana Kematian Terbaru
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

  if (!claims || claims.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Klaim Dana Kematian Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data klaim
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
            <FileText className="h-5 w-5 text-purple-600" />
            Klaim Dana Kematian Terbaru
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/pelayanan/dana-kematian">Lihat Semua</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Almarhum/ah</TableHead>
                <TableHead>Ahli Waris</TableHead>
                <TableHead>Jumlah Dana</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Meninggal</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => {
                const statusProps = getStatusProps(claim.status_proses);

                return (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.nama_anggota}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {claim.status_anggota} - {claim.status_mps}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{claim.nama_ahli_waris}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {claim.status_ahli_waris}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(claim.besaran_dana_kematian)}</span>
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
                        <span>{formatDate(claim.tanggal_meninggal)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(claim.tanggal_lapor_keluarga || claim.created_at)}
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
