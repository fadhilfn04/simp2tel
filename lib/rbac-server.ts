/**
 * Server-side RBAC Protection Helpers
 * Untuk digunakan di API routes dan Server Components
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

// Get current user with full permissions
export async function getCurrentUser() {
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

  return user;
}

// Check if current user has specific permission
export async function requirePermission(permissionSlug: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!hasPermission(user, permissionSlug)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

// Check if current user has ANY of the specified permissions
export async function requireAnyPermission(permissionSlugs: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!hasAnyPermission(user, permissionSlugs)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

// Check if current user has ALL of the specified permissions
export async function requireAllPermissions(permissionSlugs: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!hasAllPermissions(user, permissionSlugs)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

// Response helpers
export function unauthorizedResponse(message?: string) {
  return NextResponse.json(
    {
      error: message || 'Anda tidak memiliki akses ke halaman ini',
      code: 'PERMISSION_DENIED',
    },
    { status: 403 }
  );
}

export function notAuthenticatedResponse(message?: string) {
  return NextResponse.json(
    {
      error: message || 'Silakan login terlebih dahulu',
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

// HOC for API route protection
export function withPermission(permissionSlug: string) {
  return async (
    handler: (user: any, request: NextRequest) => Promise<NextResponse>,
    request: NextRequest
  ) => {
    try {
      const user = await requirePermission(permissionSlug);
      return await handler(user, request);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return notAuthenticatedResponse();
      }
      return unauthorizedResponse();
    }
  };
}

export function withAnyPermission(permissionSlugs: string[]) {
  return async (
    handler: (user: any, request: NextRequest) => Promise<NextResponse>,
    request: NextRequest
  ) => {
    try {
      const user = await requireAnyPermission(permissionSlugs);
      return await handler(user, request);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return notAuthenticatedResponse();
      }
      return unauthorizedResponse();
    }
  };
}

export function withAllPermissions(permissionSlugs: string[]) {
  return async (
    handler: (user: any, request: NextRequest) => Promise<NextResponse>,
    request: NextRequest
  ) => {
    try {
      const user = await requireAllPermissions(permissionSlugs);
      return await handler(user, request);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return notAuthenticatedResponse();
      }
      return unauthorizedResponse();
    }
  };
}
