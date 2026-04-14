import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// Define permissions
const PERMISSIONS = {
  ACCESS_KEANGGOTAAN: 'access_keanggotaan',
  MANAGE_KEANGGOTAAN: 'manage_keanggotaan',
  VIEW_KEANGGOTAAN: 'view_keanggotaan',
  ACCESS_DANA_KEMATIAN: 'access_dana_kematian',
  MANAGE_DANA_KEMATIAN: 'manage_dana_kematian',
  ACCESS_DANA_SOCIAL: 'access_dana_social',
  MANAGE_DANA_SOCIAL: 'manage_dana_social',
  ACCESS_KEUANGAN: 'access_keuangan',
  MANAGE_LAPORAN: 'manage_laporan_keuangan',
  VIEW_IURAN: 'view_iuran',
  ACCESS_SURAT: 'access_surat',
  MANAGE_SURAT: 'manage_surat',
  ACCESS_USER_MANAGEMENT: 'access_user_management',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_PERMISSIONS: 'manage_permissions',
  ACCESS_SETTINGS: 'access_settings',
  MANAGE_SYSTEM: 'manage_system',
  ALL_ACCESS: 'all_access',
} as const;

const ROLES = {
  ADMINISTRATOR: 'administrator',
  USER: 'user',
  KABID: 'kabid',
} as const;

const INITIAL_PERMISSIONS = [
  {
    slug: PERMISSIONS.ACCESS_KEANGGOTAAN,
    name: 'Akses Menu Keanggotaan',
    description: 'Akses ke menu Keanggotaan',
  },
  {
    slug: PERMISSIONS.VIEW_KEANGGOTAAN,
    name: 'View Data Keanggotaan',
    description: 'Lihat data anggota',
  },
  {
    slug: PERMISSIONS.MANAGE_KEANGGOTAAN,
    name: 'Manage Keanggotaan',
    description: 'Kelola data anggota (CRUD)',
  },
  {
    slug: PERMISSIONS.ACCESS_DANA_KEMATIAN,
    name: 'Akses Dana Kematian',
    description: 'Akses ke menu Dana Kematian',
  },
  {
    slug: PERMISSIONS.MANAGE_DANA_KEMATIAN,
    name: 'Manage Dana Kematian',
    description: 'Kelola Dana Kematian',
  },
  {
    slug: PERMISSIONS.ACCESS_DANA_SOCIAL,
    name: 'Akses Dana Sosial',
    description: 'Akses ke menu Dana Sosial',
  },
  {
    slug: PERMISSIONS.MANAGE_DANA_SOCIAL,
    name: 'Manage Dana Sosial',
    description: 'Kelola Dana Sosial',
  },
  {
    slug: PERMISSIONS.ACCESS_KEUANGAN,
    name: 'Akses Keuangan',
    description: 'Akses ke menu Keuangan',
  },
  {
    slug: PERMISSIONS.VIEW_IURAN,
    name: 'View Iuran',
    description: 'Lihat data iuran',
  },
  {
    slug: PERMISSIONS.MANAGE_LAPORAN,
    name: 'Manage Laporan Keuangan',
    description: 'Kelola laporan keuangan',
  },
  {
    slug: PERMISSIONS.ACCESS_SURAT,
    name: 'Akses Surat',
    description: 'Akses ke menu Surat Elektronik',
  },
  {
    slug: PERMISSIONS.MANAGE_SURAT,
    name: 'Manage Surat',
    description: 'Kelola surat',
  },
  {
    slug: PERMISSIONS.ACCESS_USER_MANAGEMENT,
    name: 'Akses User Management',
    description: 'Akses ke menu User Management',
  },
  {
    slug: PERMISSIONS.MANAGE_USERS,
    name: 'Manage Users',
    description: 'Kelola users',
  },
  {
    slug: PERMISSIONS.MANAGE_ROLES,
    name: 'Manage Roles',
    description: 'Kelola roles',
  },
  {
    slug: PERMISSIONS.MANAGE_PERMISSIONS,
    name: 'Manage Permissions',
    description: 'Kelola permissions',
  },
  {
    slug: PERMISSIONS.ACCESS_SETTINGS,
    name: 'Akses Settings',
    description: 'Akses ke pengaturan',
  },
  {
    slug: PERMISSIONS.MANAGE_SYSTEM,
    name: 'Manage System',
    description: 'Kelola pengaturan sistem',
  },
  {
    slug: PERMISSIONS.ALL_ACCESS,
    name: 'All Access',
    description: 'Akses penuh ke semua fitur',
  },
];

const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRATOR]: [...Object.values(PERMISSIONS)],
  [ROLES.USER]: [PERMISSIONS.ACCESS_KEANGGOTAAN, PERMISSIONS.VIEW_KEANGGOTAAN],
  [ROLES.KABID]: [
    PERMISSIONS.ACCESS_KEANGGOTAAN,
    PERMISSIONS.VIEW_KEANGGOTAAN,
    PERMISSIONS.MANAGE_KEANGGOTAAN,
    PERMISSIONS.ACCESS_DANA_KEMATIAN,
    PERMISSIONS.MANAGE_DANA_KEMATIAN,
    PERMISSIONS.ACCESS_DANA_SOCIAL,
    PERMISSIONS.MANAGE_DANA_SOCIAL,
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow authenticated users
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      permissionsCreated: [] as string[],
      permissionsExisting: [] as string[],
      permissionsAssigned: [] as string[],
      errors: [] as string[],
    };

    // 1. Create all permissions
    for (const perm of INITIAL_PERMISSIONS) {
      try {
        const existing = await prisma.userPermission.findUnique({
          where: { slug: perm.slug },
        });

        if (!existing) {
          await prisma.userPermission.create({
            data: {
              slug: perm.slug,
              name: perm.name,
              description: perm.description,
            },
          });
          results.permissionsCreated.push(perm.name);
        } else {
          results.permissionsExisting.push(perm.name);
        }
      } catch (error: any) {
        results.errors.push(`Failed to create ${perm.name}: ${error.message}`);
      }
    }

    // 2. Get all permissions from database
    const allPermissions = await prisma.userPermission.findMany();
    const permissionMap = new Map(allPermissions.map((p) => [p.slug, p.id]));

    // 3. Assign permissions to roles
    for (const [roleSlug, permissionSlugs] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS,
    )) {
      try {
        const role = await prisma.userRole.findUnique({
          where: { slug: roleSlug },
          include: { permissions: true },
        });

        if (!role) {
          results.errors.push(`Role not found: ${roleSlug}`);
          continue;
        }

        const currentPermissionIds = role.permissions.map(
          (rp) => rp.permissionId,
        );

        for (const permSlug of permissionSlugs) {
          const permId = permissionMap.get(permSlug);
          if (!permId) {
            continue;
          }

          if (!currentPermissionIds.includes(permId)) {
            await prisma.userRolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permId,
              },
            });
            results.permissionsAssigned.push(`${permSlug} -> ${role.name}`);
          }
        }
      } catch (error: any) {
        results.errors.push(
          `Failed to assign permissions to ${roleSlug}: ${error.message}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RBAC setup completed successfully',
      data: results,
      summary: {
        totalPermissions: allPermissions.length,
        permissionsCreated: results.permissionsCreated.length,
        permissionsExisting: results.permissionsExisting.length,
        permissionsAssigned: results.permissionsAssigned.length,
        errors: results.errors.length,
      },
    });
  } catch (error: any) {
    console.error('Error setting up RBAC:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup RBAC',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
