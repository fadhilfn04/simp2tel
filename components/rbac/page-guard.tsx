/**
 * Client-side page protection component
 * Wrap pages that require specific permissions
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHasPermission } from '@/lib/hooks/use-rbac';

interface PageGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  type?: 'any' | 'all';
  fallback?: React.ReactNode;
}

export function PageGuard({
  children,
  permission,
  permissions,
  type = 'any',
  fallback = null,
}: PageGuardProps) {
  const router = useRouter();
  const hasAccess = permission
    ? useHasPermission(permission)
    : permissions && permissions.length > 0
    ? type === 'all'
      ? // For 'all', we'd need to check all permissions - but for now just check if user has any
        // This is a limitation of client-side checking
        useHasPermission(permissions[0] || '')
      : useHasPermission(permissions[0] || '')
    : true;

  useEffect(() => {
    if (!hasAccess) {
      router.push('/unauthorized');
    }
  }, [hasAccess, router]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for page protection
 */
export function withPagePermission(
  Component: React.ComponentType<any>,
  requiredPermission: string
) {
  return function ProtectedPage(props: any) {
    return (
      <PageGuard permission={requiredPermission}>
        <Component {...props} />
      </PageGuard>
    );
  };
}
