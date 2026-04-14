# Panduan Lengkap RBAC (Role-Based Access Control)

## 📚 Apa itu RBAC?

RBAC adalah sistem kontrol akses berdasarkan peran (role) pengguna. Di sistem P2Tel ini:

- **User** = Pengguna (orang yang login)
- **Role** = Peran (Administrator, User, Kabid, dll)
- **Permission** = Hak akses (akses menu, edit data, dll)

## 🚀 Setup Awal

### 1. Jalankan Script Setup

```bash
# Install dependencies
npm install

# Setup permissions dan role assignments
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/setup-rbac.ts
```

### 2. Verifikasi Setup

Buka browser dan cek:
- `/user-management/permissions` - Semua permissions sudah terbuat
- `/user-management/roles` - Roles sudah memiliki permissions yang sesuai

## 📖 Cara Menggunakan

### A. Menambah Permission ke Menu

Edit `config/menu.config.tsx`:

```tsx
{
  title: 'Keanggotaan',
  icon: UserCircle,
  permissions: ['access_keanggotaan'],  // ← Tambah permissions
  children: [
    {
      title: 'Pengelolaan Data',
      path: '/keanggotaan/pengelolaan-data',
      permissions: ['view_keanggotaan'],  // ← Permission untuk submenu
    },
    {
      title: 'Tambah Anggota',
      path: '/keanggotaan/tambah',
      permissions: ['manage_keanggotaan'],  // ← Permission khusus
    },
  ],
}
```

### B. Menggunakan di Component

#### 1. Cek Permission di Component

```tsx
import { useHasPermission } from '@/lib/hooks/use-rbac';

function MyComponent() {
  const canManage = useHasPermission('manage_keanggotaan');

  if (!canManage) {
    return <div>Anda tidak memiliki akses</div>;
  }

  return <button>Tambah Anggota</button>;
}
```

#### 2. Sembunyikan Element Berdasarkan Permission

```tsx
import { useHasPermission } from '@/lib/hooks/use-rbac';

function ActionButtons() {
  const canEdit = useHasPermission('manage_keanggotaan');
  const canView = useHasPermission('view_keanggotaan');

  return (
    <div>
      {canView && <button>Lihat Data</button>}
      {canEdit && <button>Edit Data</button>}
    </div>
  );
}
```

#### 3. Multiple Permissions (AND logic)

```tsx
import { useHasAllPermissions } from '@/lib/hooks/use-rbac';

function AdminPanel() {
  // User harus memiliki SEMUA permissions ini
  const canAccess = useHasAllPermissions([
    'manage_users',
    'manage_roles'
  ]);

  if (!canAccess) {
    return <div>Access Denied</div>;
  }

  return <AdminPanel />;
}
```

#### 4. Multiple Permissions (OR logic)

```tsx
import { useHasAnyPermission } from '@/lib/hooks/use-rbac';

function PelayananMenu() {
  // User bisa memiliki SALAH SATU permission ini
  const canAccess = useHasAnyPermission([
    'access_dana_kematian',
    'access_dana_social'
  ]);

  if (!canAccess) {
    return null; // Sembunyikan menu
  }

  return <PelayananMenu />;
}
```

### C. Membuat Permission Baru

#### 1. Di file `lib/rbac.ts`

Tambahkan di constant `PERMISSIONS`:

```typescript
export const PERMISSIONS = {
  // ... permissions yang sudah ada

  // Tambah permission baru
  ACCESS_REPORT: 'access_report',
  EXPORT_DATA: 'export_data',
};
```

#### 2. Di database (via UI atau API)

Buka `/user-management/permissions` dan buat permission baru:
- **Slug**: `access_report`
- **Name**: `Access Report`
- **Description**: `Akses ke menu Report`

#### 3. Assign ke Role

Buka `/user-management/roles`, edit role yang diinginkan, dan assign permission yang baru dibuat.

### D. Setup Role Baru

Contoh: Menambah role "Bendahara"

```typescript
// 1. Tambah di lib/rbac.ts
export const ROLES = {
  ADMINISTRATOR: 'administrator',
  USER: 'user',
  KABID: 'kabid',
  BENDAHARA: 'bendahara',  // ← Role baru
} as const;

// 2. Tambah default permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  // ... existing roles

  [ROLES.BENDAHARA]: [
    PERMISSIONS.ACCESS_KEUANGAN,
    PERMISSIONS.VIEW_IURAN,
    PERMISSIONS.MANAGE_LAPORAN,
  ],
};
```

Lalu jalankan ulang setup script:
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/setup-rbac.ts
```

## 🔒 Contoh Implementasi Lengkap

### 1. Menu dengan Permissions

```tsx
// config/menu.config.tsx
{
  title: 'Keuangan',
  icon: DollarSign,
  permissions: [PERMISSIONS.ACCESS_KEUANGAN], // Parent permission
  children: [
    {
      title: 'Laporan',
      path: '/keuangan/laporan',
      permissions: [PERMISSIONS.MANAGE_LAPORAN],
    },
    {
      title: 'Data Iuran',
      path: '/keuangan/iuran',
      permissions: [PERMISSIONS.VIEW_IURAN],
    },
  ],
}
```

### 2. Page dengan Permission Check

```tsx
// app/(protected)/keuangan/laporan/page.tsx
'use client';

import { useHasPermission } from '@/lib/hooks/use-rbac';
import { useRouter } from 'next/navigation';

export default function LaporanKeuanganPage() {
  const canManageLaporan = useHasPermission('manage_laporan_keuangan');
  const router = useRouter();

  // Redirect jika tidak memiliki permission
  if (!canManageLaporan) {
    router.push('/unauthorized');
    return null;
  }

  return (
    <div>
      <h1>Laporan Keuangan</h1>
      {/* Content */}
    </div>
  );
}
```

### 3. API Route dengan Permission Check

```tsx
// app/api/keuangan/laporan/route.ts
import { getServerSession } from 'next-auth/next';
import { hasPermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cek permission
  if (!hasPermission(session.user, 'manage_laporan_keuangan')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Process request
  const data = await getLaporanData();
  return NextResponse.json(data);
}
```

## 🎯 Role-Permission Matrix

| Permission | Administrator | Kabid | User |
|-----------|---------------|-------|------|
| access_keanggotaan | ✅ | ✅ | ✅ |
| view_keanggotaan | ✅ | ✅ | ✅ |
| manage_keanggotaan | ✅ | ✅ | ❌ |
| access_dana_kematian | ✅ | ✅ | ❌ |
| manage_dana_kematian | ✅ | ✅ | ❌ |
| access_dana_social | ✅ | ✅ | ❌ |
| manage_dana_social | ✅ | ✅ | ❌ |
| access_keuangan | ✅ | ❌ | ❌ |
| manage_laporan_keuangan | ✅ | ❌ | ❌ |
| access_user_management | ✅ | ❌ | ❌ |
| manage_users | ✅ | ❌ | ❌ |
| manage_roles | ✅ | ❌ | ❌ |
| manage_permissions | ✅ | ❌ | ❌ |

**Legend**: ✅ = Have access, ❌ = No access

## 🛠️ Troubleshooting

### Menu tidak muncul meskipun sudah login?

1. Cek apakah user memiliki permission yang sesuai
2. Buka `/user-management/roles` dan assign permission ke role user
3. Clear browser cache dan refresh

### Error "Permission not found"?

1. Jalankan setup script untuk membuat permissions
2. Atau buat manual via `/user-management/permissions`

### User Administrator tidak bisa akses?

1. Pastikan role "Administrator" ada di database
2. Cek slug-nya harus "administrator" (lowercase)
3. Administrator otomatis mendapat all_access permission

## 📝 Best Practices

1. **Gunakan permission spesifik** - Lebih baik `manage_keanggotaan` daripada `all_access`
2. **Follow principle of least privilege** - Berikan permission seminimal mungkin
3. **Group permissions logically** - Kelompokkan permissions berdasarkan fitur
4. **Document your permissions** - Selalu update dokumentasi saat menambah permission baru
5. **Test thoroughly** - Selalu test dengan berbagai role setelah perubahan

## 🔄 Update Existing System

Untuk menambahkan RBAC ke sistem yang sudah ada:

1. **Tambahkan permissions ke menu** - Edit `config/menu.config.tsx`
2. **Run setup script** - Untuk membuat permissions di database
3. **Assign permissions ke roles** - Via UI atau script
4. **Test dengan user yang berbeda** - Pastikan setiap role hanya bisa akses yang seharusnya

---

**Need Help?** Cek dokumentasi NextAuth dan Prisma untuk lebih detail tentang authentication dan database structure.
