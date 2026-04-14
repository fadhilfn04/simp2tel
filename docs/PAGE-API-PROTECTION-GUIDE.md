# 🔒 Panduan Lengkap Page & API Protection

## ✅ Apa yang Baru Saja Dibuat?

### 1. **Server-side RBAC Utilities** 
File: `lib/rbac-server.ts`
- `getCurrentUser()` - Ambil user lengkap dengan role & permissions
- `requirePermission()` - Cek permission di server side
- `requireAnyPermission()` - Cek multiple permissions (OR logic)
- `requireAllPermissions()` - Cek multiple permissions (AND logic)
- Helper functions untuk error responses
- HOC wrappers `withPermission`, `withAnyPermission`, `withAllPermissions`

### 2. **Client-side Protected Route Component**
File: `components/rbac/protected-route.tsx`
- `ProtectedRoute` - Wrapper component untuk halaman
- `withProtectedRoute` - HOC untuk protection
- `withProtectedRouteAny` - HOC untuk multiple permissions (OR)
- `withProtectedRouteAll` - HOC untuk multiple permissions (AND)
- Auto redirect ke `/unauthorized` jika tidak punya akses

### 3. **Unauthorized Page**
File: `app/unauthorized/page.tsx`
- Halaman yang user lihat ketika tidak punya akses
- Informative dengan penjelasan dan next steps

### 4. **Updated API Routes**
File: `app/api/anggota/route.ts`
- **GET** `/api/anggota` - Butuh `view_keanggotaan`
- **POST** `/api/anggota` - Butuh `manage_keanggotaan`
- Proper error handling untuk permission errors

### 5. **Updated Page Component**
File: `app/(protected)/keanggotaan/pengelolaan-data/page.tsx`
- Dibungus dengan `<ProtectedRoute>` component
- Butuh `view_keanggotaan` permission untuk akses

## 🎯 Cara Menggunakan

### 1. Protect Halaman (Client-Side)

#### Method A: Gunakan ProtectedRoute Component

```tsx
// app/(protected)/keanggotaan/pengelolaan-data/page.tsx
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

export default function Page() {
  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_KEANGGGOTAAN}>
      <YourPageContent />
    </ProtectedRoute>
  );
}
```

#### Method B: Gunakan HOC

```tsx
import { withProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

function YourPage() {
  return <div>Your content</div>;
}

export default withProtectedRoute(YourPage, PERMISSIONS.VIEW_KEANGGGOTAAN);
```

#### Method C: Multiple Permissions (OR Logic)

```tsx
<ProtectedRoute 
  permissions={[PERMISSIONS.ACCESS_DANA_KEMATIAN, PERMISSIONS.ACCESS_DANA_SOCIAL]}
  type="any"
>
  <YourPage />
</ProtectedRoute>
```

#### Method D: Multiple Permissions (AND Logic)

```tsx
<ProtectedRoute 
  permissions={[PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES]}
  type="all"
>
  <AdminPage />
</ProtectedRoute>
```

### 2. Protect API Routes (Server-Side)

#### Method A: Manual Permission Check

```tsx
// app/api/anggota/route.ts
import { requirePermission, notAuthenticatedResponse, unauthorizedResponse } from '@/lib/rbac-server';
import { PERMISSIONS } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    // Check permission - akan throw error jika tidak punya akses
    await requirePermission(PERMISSIONS.VIEW_KEANGGGOTAAN);

    // ... your API logic here
    const data = await fetchData();

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error:', error);

    // Handle permission errors
    if (error.message === 'UNAUTHORIZED') {
      return notAuthenticatedResponse();
    }
    if (error.message === 'FORBIDDEN') {
      return unauthorizedResponse('Anda tidak memiliki akses');
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Method B: Gunakan HOC Wrapper

```tsx
import { withPermission } from '@/lib/rbac-server';
import { PERMISSIONS } from '@/lib/rbac';

async function handler(user: any, request: NextRequest) {
  // User sudah ter-autentikasi dan punya permission
  const data = await fetchData();
  return NextResponse.json({ data });
}

export const GET = withPermission(PERMISSIONS.VIEW_KEANGGGOTAAN)(handler);
```

### 3. Protect Components (Conditional Rendering)

```tsx
import { useHasPermission } from '@/lib/hooks/use-rbac';
import { PermissionGuard } from '@/components/rbac/permission-guard';

function ActionButtons() {
  const canEdit = useHasPermission('manage_keanggotaan');
  const canDelete = useHasPermission('manage_keanggotaan');

  return (
    <div>
      {/* Method 1: Hook */}
      {canEdit && <button>Edit</button>}

      {/* Method 2: Component */}
      <PermissionGuard permission="manage_keanggotaan">
        <button>Delete</button>
      </PermissionGuard>
    </div>
  );
}
```

## 📋 Contoh Implementasi Lengkap

### Contoh 1: Halaman User Management

```tsx
// app/(protected)/user-management/users/page.tsx
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

export default function UsersPage() {
  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_USERS}>
      <UsersTable />
    </ProtectedRoute>
  );
}
```

```tsx
// app/api/user-management/users/route.ts
import { withPermission } from '@/lib/rbac-server';
import { PERMISSIONS } from '@/lib/rbac';

async function handler(user: any, request: NextRequest) {
  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}

export const GET = withPermission(PERMISSIONS.MANAGE_USERS)(handler);
export const POST = withPermission(PERMISSIONS.MANAGE_USERS)(handler);
```

### Contoh 2: Halaman dengan Multiple Permissions

```tsx
// Pelayanan yang butuh akses ke salah satu: Dana Kematian ATAU Dana Sosial
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

export default function PelayananPage() {
  return (
    <ProtectedRoute 
      permissions={[PERMISSIONS.ACCESS_DANA_KEMATIAN, PERMISSIONS.ACCESS_DANA_SOCIAL]}
      type="any"
    >
      <PelayananContent />
    </ProtectedRoute>
  );
}
```

### Contoh 3: Halaman Admin (Butuh SEMUA permissions)

```tsx
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute 
      permissions={[PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_SYSTEM]}
      type="all"
    >
      <AdminContent />
    </ProtectedRoute>
  );
}
```

## 🔍 Test Checklist

Setelah implement protection, test semua ini:

### Test 1: Page Protection
- [ ] Login sebagai role "User"
- [ ] Coba akses `/user-management/users` via URL → Harus redirect ke `/unauthorized`
- [ ] Coba akses `/keanggotaan/pengelolaan-data` → Harus bisa (punya permission)

### Test 2: API Protection
- [ ] Login sebagai role "User"
- [ ] Coba GET `/api/anggota` → Harus bisa (punya permission view)
- [ ] Coba POST `/api/anggota` → Harus gagal (403 Forbidden)
- [ ] Cek console untuk response yang benar

### Test 3: Menu Filtering
- [ ] Login sebagai role "User" → Hanya menu Keanggotaan muncul
- [ ] Login sebagai role "Administrator" → Semua menu muncul
- [ ] Login sebagai role "Kabid" → Keanggotaan + User Management muncul

### Test 4: Component-Level Protection
- [ ] Button Edit hilang untuk user tanpa permission
- [ ] Button Delete hanya muncul untuk user dengan permission
- [ ] Form fields disabled/hidden sesuai permission

## 🛡️ Best Practices

### 1. Always Check Both Levels
```tsx
// ✅ GOOD: Double protection
<ProtectedRoute permission={PERMISSIONS.MANAGE_USERS}>  // Page level
  <UserManagementContent />  // Component level with permission checks
</ProtectedRoute>

// ❌ BAD: Hanya page protection
<UserManagementContent />  // Bisa diakses kalau user tahu URL
```

### 2. Use Specific Permissions
```tsx
// ✅ GOOD: Specific permission
<ProtectedRoute permission={PERMISSIONS.MANAGE_KEANGGOTAAN}>

// ❌ BAD: Terlalu umum (kecuali untuk admin)
<ProtectedRoute permission={PERMISSIONS.ACCESS_KEANGGOTAAN}>
```

### 3. Handle Errors Gracefully
```tsx
// ✅ GOOD: Proper error handling
try {
  await requirePermission(PERMISSIONS.MANAGE_KEANGGOTAAN);
  // API logic
} catch (error) {
  if (error.message === 'UNAUTHORIZED') {
    return notAuthenticatedResponse();
  }
  return unauthorizedResponse('Custom message');
}
```

### 4. Log Permission Denials
```tsx
// Untuk security audit
import { systemLog } from '@/services/system-log';

if (error.message === 'FORBIDDEN') {
  await systemLog({
    event: 'permission_denied',
    userId: user.id,
    entityType: 'api_access',
    description: `User ${user.email} tried to access ${request.url}`,
  });
}
```

## 🚀 Quick Start untuk Halaman Baru

### Step 1: Tambah Permission ke Menu Config
```tsx
// config/menu.config.tsx
{
  title: 'Halaman Baru',
  path: '/halaman-baru',
  permissions: [PERMISSIONS.MANAGE_KEANGGOTAAN],
}
```

### Step 2: Protect Halaman
```tsx
// app/(protected)/halaman-baru/page.tsx
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';

export default function HalamanBaruPage() {
  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_KEANGGOTAAN}>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### Step 3: Protect API
```tsx
// app/api/halaman-baru/route.ts
import { requirePermission, unauthorizedResponse, notAuthenticatedResponse } from '@/lib/rbac-server';
import { PERMISSIONS } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_KEANGGOTAAN);
    // ... logic
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return notAuthenticatedResponse();
    if (error.message === 'FORBIDDEN') return unauthorizedResponse();
    throw error;
  }
}
```

## 📊 Matrix Permission vs Protection

| Feature | Need Permission? | Protected By |
|---------|-----------------|--------------|
| **Menu visibility** | ✅ YES | Sidebar filtering |
| **Page access (URL)** | ✅ YES | ProtectedRoute component |
| **Page rendering** | ✅ YES | ProtectedRoute component |
| **API GET** | ✅ YES | requirePermission() |
| **API POST** | ✅ YES | requirePermission() |
| **API PUT/DELETE** | ✅ YES | requirePermission() |
| **Button visibility** | ✅ YES | PermissionGuard component |
| **Form fields** | ✅ YES | useHasPermission() hook |

## 🎉 Summary

Sekarang sistem RBAC sudah **COMPLETE** dengan:

- ✅ **Menu Filtering** - Otomatis filter menu
- ✅ **Page Protection** - Tidak bisa akses via URL
- ✅ **API Protection** - API routes aman
- ✅ **Component Protection** - Conditional rendering
- ✅ **Auto Redirect** - Ke `/unauthorized` jika tidak punya akses
- ✅ **Proper Error Handling** - Response 401/403 yang jelas
- ✅ **Server & Client** - Lengkap untuk kedua environment

User dengan role "User" sekarang:
- ❌ Tidak bisa lihat menu User Management
- ❌ Tidak bisa akses `/user-management/users` via URL
- ❌ Tidak bisa POST ke `/api/anggota` (403 Forbidden)
- ✅ Hanya bisa lihat data anggota

Selamat mencoba! 🎉
