'use client';

import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Akses Ditolak
          </h1>
          <p className="text-muted-foreground text-lg">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm font-medium text-foreground">
            Kemungkinan penyebab:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Role Anda tidak memiliki permission yang cukup</li>
            <li>Sesi login sudah kadaluarsa, silakan login ulang</li>
            <li>Halaman ini memerlukan akses khusus</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Kembali ke Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/signin">
              Login Ulang
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Jika Anda merasa ini adalah kesalahan, hubungi administrator sistem.
        </p>
      </div>
    </div>
  );
}
