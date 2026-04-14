# RBAC Implementation Status - Complete Guide

## ✅ Apa yang Sudah Berhasil Diimplementasikan

### 1. **Database Structure** ✅
- Table `UserRole` - untuk menyimpan roles
- Table `UserPermission` - untuk menyimpan permissions
- Table `UserRolePermission` - junction table untuk role-permission relationships

### 2. **Core RBAC System** ✅
- `lib/rbac.ts` - Permission checking functions
  - `hasPermission()` - Cek single permission
  - `hasAnyPermission()` - Cek multiple permission (OR logic)
  - `hasAllPermissions()` - Cek multiple permission (AND logic)
  - `filterMenuByPermissions()` - Filter menu items

### 3. **React Hooks** ✅
- `lib/hooks/use-rbac.ts` - Client-side hooks
  - `useHasPermission()` - Cek permission di component
  - `useHasAnyPermission()` - Multiple permission check (OR)
  - `useHasAllPermissions()` - Multiple permission check (AND)
  - `useUserRole()` - Get current user role
  - `useUserPermissions()` - Get all user permissions

### 4. **Components** ✅
- `components/rbac/permission-guard.tsx` - Conditional rendering based on permissions
- `components/rbac/page-guard.tsx` - Page-level protection component

### 5. **Menu Filtering** ✅
- `config/menu.config.tsx` - Menu items dengan permissions
- `app/components/layouts/demo1/sidebar-menu.tsx` - Sidebar dengan permission filtering

### 6. **Auth Integration** ✅
- `app/api/auth/[...nextauth]/auth-options.ts` - Session includes role & permissions
- `types/next-auth.d.ts` - TypeScript types untuk extended session
- `lib/auth.ts` - Server-side auth utilities

### 7. **Setup Scripts** ✅
- `scripts/setup-rbac.ts` - Command-line setup script
- `app/api/setup-rbac/route.ts` - API endpoint untuk setup
- `setup-rbac.html` - HTML helper untuk setup via browser

### 8. **Documentation** ✅
- `docs/RBAC-GUIDE.md` - Panduan lengkap
- `docs/RBAC-SETUP.md` - Quick setup guide

## 🎯 Current Status: What Works & What Doesn't

### ✅ WORKING: Menu Filtering
```tsx
✅ User dengan role "User" hanya melihat menu Keanggotaan
✅ Administrator melihat semua menu
✅ Kabid melihat Keanggotaan + User Management
✅ Menu terfilter secara real-time berdasarkan permissions
```

### ✅ WORKING: Session Data
```tsx
✅ Session includes role data: user.role.slug, user.role.name
✅ Session includes permissions: user.role.permissions[]
✅ TypeScript types properly defined
```

### ✅ WORKING: Permission Checks
```tsx
✅ Client-side hooks: useHasPermission('manage_keanggotaan')
✅ Server-side utilities: requirePermission('manage_users')
✅ Permission Guard component untuk conditional rendering
```

### ⚠️ PARTIALLY WORKING: Page-Level Protection
```tsx
⚠️ URL protection via middleware (basic auth only)
⚠️ Client-side PageGuard component created
❌ Server-side page protection belum diimplementasikan di setiap route
```

### ❌ NOT WORKING: API Route Protection
```tsx
❌ API routes belum diprotect dengan permission checks
❌ Bisa akses API langsung tanpa permission yang cukup
```

## 🔧 Cara Menggunakan Sekarang

### 1. Cek Setup RBAC

**Pastikan RBAC sudah di-setup:**
```bash
# Option 1: Via HTML (paling mudah)
open setup-rbac.html
# Klik tombol "Setup RBAC Sekarang"

# Option 2: Via API
curl -X POST http://localhost:3000/api/setup-rbac

# Option 3: Via command line
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/setup-rbac.ts
```

### 2. Test dengan Berbagai Role

**Login sebagai User Role:**
- Hanya melihat menu Keanggotaan
- Bisa view data anggota
- Tidak bisa edit (tapi masih bisa karena belum ada page protection)

**Login sebagai Kabid:**
- Melihat Keanggotaan + User Management
- Bisa manage data anggota
- Bisa access Dana Kematian (jika di-uncomment di menu)

**Login sebagai Administrator:**
- Melihat semua menu
- Full access ke semua fitur

### 3. Gunakan Permission Checks di Component

```tsx
// Client-side example
import { useHasPermission } from '@/lib/hooks/use-rbac';
import { PermissionGuard } from '@/components/rbac/permission-guard';

function MyComponent() {
  const canEdit = useHasPermission('manage_keanggotaan');

  return (
    <div>
      <PermissionGuard permission="manage_keanggotaan">
        <button>Edit Data</button>
      </PermissionGuard>

      {canEdit && <button>Hapus Data</button>}
    </div>
  );
}
```

### 4. Protect API Routes (Manual)

Untuk sekarang, **TAMBAHKAN MANUAL** permission checks di API routes:

```tsx
// app/api/anggota/route.ts
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Tambahkan ini di setiap API route yang butuh protection
  try {
    const user = await requirePermission('view_keanggotaan');
    // ... rest of your code
  } catch (error) {
    return NextResponse.json(
      { error: 'Anda tidak memiliki akses' },
      { status: 403 }
    );
  }
}
```

## 🚀 Next Steps (Opsional tapi Direkomendasikan)

### 1. Tambah Server-Side Page Protection

Create atau update layout untuk protected routes:

```tsx
// app/(protected)/keanggotaan/layout.tsx
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function KeanggotaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect jika tidak punya permission
  if (!user || !hasPermission(user, 'access_keanggotaan')) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
```

### 2. Protect API Routes Systematically

Gunakan helper function yang sudah dibuat:

```tsx
import { withPermission } from '@/lib/auth';

const handler = withPermission('manage_keanggotaan')(async (user) => {
  // Your API logic here
  return NextResponse.json({ data });
});

export { handler as GET, handler as POST };
```

### 3. Add Role-Based UI Elements

Tampilkan/hide elements berdasarkan role:

```tsx
import { useUserRole } from '@/lib/hooks/use-rbac';

function AdminPanel() {
  const role = useUserRole();

  if (role?.slug !== 'administrator') {
    return null;
  }

  return <div>Admin Only Content</div>;
}
```

## 📊 Testing Checklist

Sebelum production, test semua ini:

- [ ] Setup RBAC (jalankan setup script)
- [ ] Login sebagai Administrator - semua menu muncul
- [ ] Login sebagai Kabid - hanya menu tertentu
- [ ] Login sebagai User - hanya Keanggotaan
- [ ] Coba akses URL langsung ke halaman yang tidak boleh
- [ ] Test permission hooks di components
- [ ] Test API routes dengan berbagai role
- [ ] Verify session data includes role & permissions
- [ ] Check database: roles, permissions, dan assignments

## 🔍 Debugging

### Jika menu tidak muncul:

1. **Check session data:**
```tsx
// Add di component
console.log('User:', session?.user);
console.log('Role:', session?.user?.role);
console.log('Permissions:', session?.user?.role?.permissions);
```

2. **Check permissions di database:**
```bash
# Buka Prisma Studio atau query database
SELECT * FROM "UserRole" WHERE slug = 'user';
SELECT * FROM "UserRolePermission" WHERE "roleId" = (SELECT id FROM "UserRole" WHERE slug = 'user');
```

3. **Check menu permissions:**
```tsx
console.log('Menu permissions:', MENU_SIDEBAR);
```

### Jika error "Unauthorized":

1. Pastikan sudah login
2. Check apakah session valid
3. Verify user role di database

### Jika permission check gagal:

1. Pastikan setup script sudah dijalankan
2. Check apakah permissions exist di database
3. Verify role-permission assignments

## 📝 Summary

**Working:**
- ✅ Menu filtering (sidebar)
- ✅ Session dengan role & permissions
- ✅ Permission checking functions
- ✅ React hooks untuk permissions
- ✅ Permission Guard component

**Need Manual Implementation:**
- 🔧 Page-level protection (tambah di setiap layout)
- 🔧 API route protection (tambah helper di setiap route)

**Setup Required:**
- 🚀 Jalankan setup script (pilih 1 dari 3 cara)

---

**Status**: RBAC system sudah terpas dan berfungsi untuk menu filtering. Untuk production, disarankan menambahkan page-level dan API protection secara bertahap.
