# RBAC Setup Summary

## ✅ Apa yang sudah dibuat?

### 1. **Core RBAC System** (`lib/rbac.ts`)

- Fungsi `hasPermission()` - Cek single permission
- Fungsi `hasAnyPermission()` - Cek multiple permission (OR logic)
- Fungsi `hasAllPermissions()` - Cek multiple permission (AND logic)
- Fungsi `filterMenuByPermissions()` - Filter menu based permissions
- Constant `PERMISSIONS` - Daftar semua permissions
- Constant `DEFAULT_ROLE_PERMISSIONS` - Default permissions per role

### 2. **React Hooks** (`lib/hooks/use-rbac.ts`)

- `useHasPermission()` - Hook untuk cek single permission
- `useHasAnyPermission()` - Hook untuk cek multiple permission (OR)
- `useHasAllPermissions()` - Hook untuk cek multiple permission (AND)
- `useFilteredMenu()` - Hook untuk filter menu
- `useUserPermissions()` - Hook untuk dapat semua permissions user
- `useUserRole()` - Hook untuk dapat role user

### 3. **Permission Guard Component** (`components/rbac/permission-guard.tsx`)

- `PermissionGuard` - Component untuk wrap dan hide/show berdasarkan permission
- `withPermission()` - HOC untuk wrap component dengan permission

### 4. **Setup Script** (`scripts/setup-rbac.ts`)

- Script untuk membuat permissions di database
- Script untuk assign permissions ke roles

### 5. **Documentation**

- `docs/RBAC-GUIDE.md` - Panduan lengkap RBAC
- File ini - Setup summary

## 🚀 Cara Menggunakan

### Step 1: Setup Database

```bash
# Jalankan script setup
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/setup-rbac.ts
```

Ini akan:

- Membuat semua permissions di database
- Assign permissions ke roles yang sesuai

### Step 2: Update Menu Configuration

Edit `config/menu.config.tsx` untuk menambahkan permissions:

```tsx
{
  title: 'Keanggotaan',
  icon: UserCircle,
  permissions: [PERMISSIONS.ACCESS_KEANGGOTAAN],
  children: [
    {
      title: 'Pengelolaan Data',
      path: '/keanggotaan/pengelolaan-data',
      permissions: [PERMISSIONS.VIEW_KEANGGOTAAN],
    },
  ],
}
```

### Step 3: Gunakan di Components

```tsx
import { PermissionGuard } from '@/components/rbac/permission-guard';

function MyComponent() {
  return (
    <PermissionGuard permission="manage_keanggotaan">
      <button>Edit Data</button>
    </PermissionGuard>
  );
}
```

Atau gunakan hooks:

```tsx
import { useHasPermission } from '@/lib/hooks/use-rbac';

function MyComponent() {
  const canEdit = useHasPermission('manage_keanggotaan');

  if (!canEdit) return null;

  return <button>Edit Data</button>;
}
```

## 📋 Permissions yang Tersedia

### Keanggotaan

- `access_keanggotaan` - Akses menu Keanggotaan
- `view_keanggotaan` - Lihat data anggota
- `manage_keanggotaan` - Kelola data anggota (CRUD)

### Pelayanan

- `access_dana_kematian` - Akses Dana Kematian
- `manage_dana_kematian` - Kelola Dana Kematian
- `access_dana_social` - Akses Dana Sosial
- `manage_dana_social` - Kelola Dana Sosial

### Keuangan

- `access_keuangan` - Akses Keuangan
- `view_iuran` - Lihat iuran
- `manage_laporan_keuangan` - Kelola laporan keuangan

### Surat

- `access_surat` - Akses Surat
- `manage_surat` - Kelola surat

### User Management

- `access_user_management` - Akses User Management
- `manage_users` - Kelola users
- `manage_roles` - Kelola roles
- `manage_permissions` - Kelola permissions

### System

- `access_settings` - Akses Settings
- `manage_system` - Kelola sistem
- `all_access` - Full access (administrator only)

## 👥 Roles dan Permissions

### Administrator

- Semua permissions
- Full access ke semua fitur

### Kabid

- Keanggotaan (view, manage)
- Dana Kematian (access, manage)
- Dana Sosial (access, manage)

### User

- Keanggotaan (view only)

## 🔍 Verifikasi Setup

Setelah setup, cek:

1. **Login sebagai Administrator**
   - Buka semua menu
   - Semua harus bisa diakses

2. **Login sebagai Kabid**
   - Menu Keanggotaan muncul
   - Submenu bisa diakses
   - Menu User Management TIDAK muncul

3. **Login sebagai User**
   - Hanya menu Keanggotaan
   - Hanya bisa view, tidak bisa edit

## 🛠️ Troubleshooting

### Menu tidak muncul?

- Cek apakah permissions sudah diassign ke role
- Refresh browser dan login ulang
- Cek console untuk error

### Permission error di API?

- Pastikan setup script sudah dijalankan
- Cek table `UserRolePermission` di database
- Verify role user di table `User`

### User tidak bisa akses halaman?

- Cek session user
- Verify role dan permissions
- Pastikan permission slug sama dengan yang di code

## 📚 Resources

- [Panduan Lengkap](./RBAC-GUIDE.md) - Dokumentasi lengkap RBAC
- `/user-management/permissions` - Kelola permissions via UI
- `/user-management/roles` - Kelola roles via UI

## 🎯 Next Steps

1. ✅ Setup sudah selesai
2. ✅ Core functions dan hooks sudah dibuat
3. ✅ Documentation sudah lengkap

**Sekarang kamu bisa:**

- Menambah permission baru di menu
- Menggunakan PermissionGuard di components
- Mengatur permissions per role via UI
- Membuat role baru dengan permissions spesifik

---

**Created by Claude** - RBAC Implementation for P2Tel System
