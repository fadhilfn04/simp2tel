/**
 * Protected Route Wrapper
 * Untuk membungus halaman yang butuh permission check
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  type?: 'any' | 'all';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  permission,
  permissions,
  type = 'any',
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      setIsChecking(false);

      // If no session, redirect to signin
      if (!session) {
        router.push('/signin');
        return;
      }

      // Check permissions
      let hasAccess = false;

      if (permission) {
        hasAccess = hasPermission(session.user as any, permission);
      } else if (permissions && permissions.length > 0) {
        if (type === 'all') {
          hasAccess = hasAllPermissions(session.user as any, permissions);
        } else {
          hasAccess = hasAnyPermission(session.user as any, permissions);
        }
      } else {
        // No permission check needed
        hasAccess = true;
      }

      // Redirect if no access
      if (!hasAccess) {
        router.push('/unauthorized');
      }
    }

    checkPermission();
  }, [session, status, permission, permissions, type, router]);

  // Show loading while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for easier usage
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute permission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export function withProtectedRouteAny<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute permissions={requiredPermissions} type="any">
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export function withProtectedRouteAll<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute permissions={requiredPermissions} type="all">
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
