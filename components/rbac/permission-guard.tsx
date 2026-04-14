/**
 * PermissionGuard Component
 * Wrap components to conditionally render based on permissions
 */

import { ReactNode } from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '@/lib/hooks/use-rbac';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  type?: 'any' | 'all';
  fallback?: ReactNode;
  redirectTo?: string;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  type = 'any',
  fallback = null,
}: PermissionGuardProps) {
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = useHasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    if (type === 'all') {
      hasAccess = useHasAllPermissions(permissions);
    } else {
      hasAccess = useHasAnyPermission(permissions);
    }
  } else {
    // No permission check needed
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component version
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
) {
  return function PermissionComponent(props: P) {
    const hasAccess = useHasPermission(requiredPermission);

    if (!hasAccess) {
      return null; // Or return a fallback component
    }

    return <Component {...props} />;
  };
}

/**
 * Usage Examples:
 *
 * // Single permission
 * <PermissionGuard permission="manage_keanggotaan">
 *   <button>Edit Anggota</button>
 * </PermissionGuard>
 *
 * // Multiple permissions (any)
 * <PermissionGuard
 *   permissions={['access_dana_kematian', 'access_dana_social']}
 *   type="any"
 * >
 *   <PelayananMenu />
 * </PermissionGuard>
 *
 * // Multiple permissions (all)
 * <PermissionGuard
 *   permissions={['manage_users', 'manage_roles']}
 *   type="all"
 *   fallback={<div>Access Denied</div>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * // HOC version
 * const ProtectedButton = withPermission(DeleteButton, 'manage_keanggotaan');
 */
