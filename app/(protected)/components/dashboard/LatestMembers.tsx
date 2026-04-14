'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { UserPlus, Mail, Phone, MapPin } from 'lucide-react';
import { Anggota } from '@/lib/supabase';
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
import { useHasPermission } from '@/lib/hooks/use-rbac';
import { PERMISSIONS } from '@/lib/rbac';

interface LatestMembersProps {
  members: Anggota[];
  isLoading: boolean;
}

export function LatestMembers({ members, isLoading }: LatestMembersProps) {
  // Check if user has permission to view keanggotaan
  const canViewKeanggotaan = useHasPermission(PERMISSIONS.VIEW_KEANGGOTAAN);
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'aktif':
        return { variant: 'success' as const, label: 'Aktif' };
      case 'non-aktif':
        return { variant: 'destructive' as const, label: 'Non-Aktif' };
      case 'meninggal':
        return { variant: 'destructive' as const, label: 'Meninggal' };
      case 'pindah':
        return { variant: 'warning' as const, label: 'Pindah' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
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
            <UserPlus className="h-5 w-5" />
            Anggota Terbaru
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

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Anggota Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data anggota
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
            <UserPlus className="h-5 w-5 text-blue-600" />
            Anggota Terbaru
          </CardTitle>
          {canViewKeanggotaan && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/keanggotaan/pengelolaan-data">Lihat Semua</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anggota</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Status Anggota</TableHead>
                <TableHead>Domisili</TableHead>
                <TableHead>Tanggal Gabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const statusProps = getStatusProps(member.status_anggota || 'non-aktif');

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.nama_anggota}</div>
                        <div className="text-xs text-muted-foreground font-mono">{member.nik}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.alamat && (
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{member.alamat}</span>
                          </div>
                        )}
                        {member.nomor_handphone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{member.nomor_handphone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusProps.variant} appearance="ghost">
                        <BadgeDot />
                        {statusProps.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{member.nama_cabang}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(member.created_at)}
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
