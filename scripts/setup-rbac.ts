/**
 * Setup RBAC - Initial Permissions and Role Assignments
 * Run this script to set up the initial RBAC structure
 *
 * Usage: npx ts-node scripts/setup-rbac.ts
 */

import { PrismaClient } from '@prisma/client';

// Define permissions directly (avoiding import issues)
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
  MANAGE_IURAN: 'manage_iuran',
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
  KETUA_1: 'ketua-1',
} as const;

const INITIAL_PERMISSIONS = [
  // Keanggotaan
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

  // Pelayanan
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

  // Keuangan
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
    slug: PERMISSIONS.MANAGE_IURAN,
    name: 'Manage Iuran',
    description: 'Kelola data iuran (CRUD)',
  },
  {
    slug: PERMISSIONS.MANAGE_LAPORAN,
    name: 'Manage Laporan Keuangan',
    description: 'Kelola laporan keuangan',
  },

  // Surat
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

  // User Management
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

  // System
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
  [ROLES.ADMINISTRATOR]: [
    // Administrator memiliki semua permissions
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.USER]: [
    // User biasa hanya bisa view
    PERMISSIONS.ACCESS_KEANGGOTAAN,
    PERMISSIONS.VIEW_KEANGGOTAAN,
  ],

  [ROLES.KETUA_1]: [
    // Ketua 1 memiliki akses ke Keanggotaan, Pelayanan, dan Keuangan
    PERMISSIONS.ACCESS_KEANGGOTAAN,
    PERMISSIONS.VIEW_KEANGGOTAAN,
    PERMISSIONS.MANAGE_KEANGGOTAAN,
    PERMISSIONS.ACCESS_DANA_KEMATIAN,
    PERMISSIONS.MANAGE_DANA_KEMATIAN,
    PERMISSIONS.ACCESS_DANA_SOCIAL,
    PERMISSIONS.MANAGE_DANA_SOCIAL,
    PERMISSIONS.ACCESS_KEUANGAN,
    PERMISSIONS.VIEW_IURAN,
    PERMISSIONS.MANAGE_IURAN,
  ],
};

const prisma = new PrismaClient();

async function setupRBAC() {
  console.log('🚀 Setting up RBAC...');

  try {
    // 1. Create all permissions
    console.log('📝 Creating permissions...');
    for (const perm of INITIAL_PERMISSIONS) {
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
        console.log(`  ✅ Created permission: ${perm.name}`);
      } else {
        console.log(`  ⏭️  Permission exists: ${perm.name}`);
      }
    }

    // 2. Get all permissions from database
    const allPermissions = await prisma.userPermission.findMany();
    const permissionMap = new Map(allPermissions.map((p) => [p.slug, p.id]));

    // 3. Assign permissions to roles
    console.log('\n👥 Assigning permissions to roles...');

    for (const [roleSlug, permissionSlugs] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS,
    )) {
      const role = await prisma.userRole.findUnique({
        where: { slug: roleSlug },
        include: { permissions: true },
      });

      if (!role) {
        console.log(`  ⚠️  Role not found: ${roleSlug}`);
        continue;
      }

      // Get current permission IDs
      const currentPermissionIds = role.permissions.map(
        (rp) => rp.permissionId,
      );

      // Find new permissions to add
      for (const permSlug of permissionSlugs) {
        const permId = permissionMap.get(permSlug);
        if (!permId) {
          console.log(`  ⚠️  Permission not found: ${permSlug}`);
          continue;
        }

        // Check if role already has this permission
        if (!currentPermissionIds.includes(permId)) {
          await prisma.userRolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permId,
            },
          });
          console.log(`  ✅ Assigned ${permSlug} to ${role.name}`);
        }
      }

      console.log(
        `  📋 ${role.name}: ${role.permissions.length} existing permissions`,
      );
    }

    console.log('\n✅ RBAC setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Total permissions: ${allPermissions.length}`);
    console.log(
      `  - Roles configured: ${Object.keys(DEFAULT_ROLE_PERMISSIONS).length}`,
    );
    console.log('\n💡 Next steps:');
    console.log('  1. Check permissions at /user-management/permissions');
    console.log('  2. Check roles at /user-management/roles');
    console.log('  3. Assign users to roles');
  } catch (error) {
    console.error('❌ Error setting up RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupRBAC();
