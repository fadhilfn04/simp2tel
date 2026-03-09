import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="relative overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <Table className={className}>{children}</Table>
    </div>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  isHeader?: boolean;
}

export function ResponsiveTableCell({
  children,
  className = '',
  hideOnMobile = false,
  isHeader = false,
}: ResponsiveTableCellProps) {
  const baseClasses = isHeader
    ? 'px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm'
    : 'px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm';

  const mobileClasses = hideOnMobile ? 'hidden sm:table-cell' : '';

  return (
    <TableCell className={`${baseClasses} ${mobileClasses} ${className}`}>
      {children}
    </TableCell>
  );
}

interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export function ResponsiveTableHeader({ children, className, hideOnMobile }: ResponsiveTableHeaderProps) {
  return (
    <TableHead className={`${hideOnMobile ? 'hidden sm:table-cell' : ''} ${className}`}>
      {children}
    </TableHead>
  );
}

interface MobileCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function MobileCard({ children, title, subtitle, actions }: MobileCardProps) {
  return (
    <div className="sm:hidden border rounded-lg p-4 mb-3 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-1">{actions}</div>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
