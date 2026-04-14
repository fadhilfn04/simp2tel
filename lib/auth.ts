/**
 * Auth utilities untuk RBAC
 */

import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';
import { User } from '@/app/models/user';
import { NextResponse } from 'next/server';

/**
 * Get current user with full role and permissions data
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  return user as User | null;
}

/**
 * Check if current user has permission (server-side)
 */
export async function requirePermission(permissionSlug: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!hasPermission(user, permissionSlug)) {
    throw new Error('Forbidden');
  }

  return user;
}

/**
 * Response helper for unauthorized access
 */
export function unauthorizedResponse(message: string = 'Anda tidak memiliki akses') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Protect API route with permission check
 */
export function withPermission(permissionSlug: string) {
  return async (handler: (user: User) => Promise<Response>) => {
    try {
      const user = await requirePermission(permissionSlug);
      return await handler(user);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Silakan login terlebih dahulu' },
          { status: 401 }
        );
      }
      return unauthorizedResponse();
    }
  };
}
