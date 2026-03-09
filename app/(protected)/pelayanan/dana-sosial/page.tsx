'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/toolbar';
import { Container } from '@/components/common/container';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  FileText,
} from 'lucide-react';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, BadgeDot } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDanaSosialList,
  useCreateDanaSosial,
  useDeleteDanaSosial,
  useUpdateDanaSosial,
  useDanaSosial,
} from '@/lib/hooks/use-dana-sosial-api';
import { DanaSosial, CreateDanaSosialInput, JenisBantuan, StatusPengajuanSosial, StatusPenyaluran } from '@/lib/supabase';
import {
  DanaSosialFormModal,
  DanaSosialDetailModal,
  DeleteConfirmDialog,
} from '@/components/dana-sosial';
import { ToastNotification } from '@/components/anggota/ToastNotification';
import { useAnggotaList } from '@/lib/hooks/use-anggota-api';

export default function DanaSosialPage() {
  // State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJenis, setSelectedJenis] = useState<string>('all');
  const [selectedPenyaluran, setSelectedPenyaluran] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Modal states
  const [selectedClaim, setSelectedClaim] = useState<DanaSosial | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editClaimId, setEditClaimId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<DanaSosial | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'success' });

  // API hooks
  const { data: danaSosialData, isLoading } = useDanaSosialList({
    search: searchQuery,
    jenis_bantuan: selectedJenis as JenisBantuan,
    status_pengajuan: selectedStatus as StatusPengajuanSosial,
    status_penyaluran: selectedPenyaluran as StatusPenyaluran,
    tanggal_pengajuan_from: dateFrom,
    tanggal_pengajuan_to: dateTo,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  // Fetch members for dropdown (only for create mode)
  const { data: membersData } = useAnggotaList({
    search: '',
    page: 1,
    limit: 1000,
  });

  const { data: editClaimData } = useDanaSosial(editClaimId || '');
  const createMutation = useCreateDanaSosial();
  const updateMutation = useUpdateDanaSosial(editClaimId || '');
  const deleteMutation = useDeleteDanaSosial();

  // Helper functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const getStatusProps = (status: DanaSosial['status_pengajuan']) => {
    switch (status) {
      case 'Pending':
        return { variant: 'secondary' as const, label: 'Pending' };
      case 'Dalam Review':
        return { variant: 'info' as const, label: 'Review' };
      case 'Disetujui':
        return { variant: 'success' as const, label: 'Disetujui' };
      case 'Ditolak':
        return { variant: 'destructive' as const, label: 'Ditolak' };
      case 'Disalurkan':
        return { variant: 'warning' as const, label: 'Disalurkan' };
      case 'Selesai':
        return { variant: 'success' as const, label: 'Selesai' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const getPenyaluranProps = (status: DanaSosial['status_penyaluran']) => {
    switch (status) {
      case 'Belum Disalurkan':
        return { variant: 'secondary' as const, label: 'Belum' };
      case 'Dalam Proses':
        return { variant: 'info' as const, label: 'Proses' };
      case 'Sudah Disalurkan':
        return { variant: 'success' as const, label: 'Disalurkan' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Event handlers
  const handleCreate = async (data: CreateDanaSosialInput) => {
    try {
      await createMutation.mutateAsync(data);
      showToast('Pengajuan dana sosial berhasil diajukan', 'success');
      setAddModalOpen(false);
    } catch (error) {
      console.error('Error creating claim:', error);
      showToast('Gagal mengajukan dana sosial', 'error');
      throw error;
    }
  };

  const handleUpdate = async (data: CreateDanaSosialInput) => {
    try {
      await updateMutation.mutateAsync(data);
      showToast('Data dana sosial berhasil diperbarui', 'success');
      setEditModalOpen(false);
      setEditClaimId(null);
    } catch (error) {
      console.error('Error updating claim:', error);
      showToast('Gagal memperbarui data dana sosial', 'error');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (claimToDelete) {
      try {
        await deleteMutation.mutateAsync(claimToDelete.id);
        showToast('Pengajuan dana sosial berhasil dihapus', 'success');
        setDeleteConfirmOpen(false);
        setClaimToDelete(null);
      } catch (error) {
        console.error('Error deleting claim:', error);
        showToast('Gagal menghapus data dana sosial', 'error');
      }
    }
  };

  // Table columns
  const columns = useMemo<ColumnDef<DanaSosial>[]>(
    () => [
      {
        accessorKey: 'no',
        header: 'NO',
        cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
      },
      {
        accessorKey: 'created_at',
        header: 'TGL PENGAJUAN',
        cell: ({ row }) => <span className="text-xs sm:text-sm">{formatDate(row.original.created_at)}</span>,
      },
      {
        accessorKey: 'nama_pemohon',
        header: 'NAMA PEMOHON',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-xs sm:text-sm">{row.original.nama_pemohon}</div>
            {row.original.nikap_pemohon && (
              <div className="text-xs text-muted-foreground font-mono">{row.original.nikap_pemohon}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'jenis_bantuan',
        header: 'JENIS',
        cell: ({ row }) => (
          <Badge variant="secondary" appearance="ghost" className="text-xs">
            {row.original.jenis_bantuan}
          </Badge>
        ),
      },
      {
        accessorKey: 'jumlah_diajukan',
        header: 'DIAJUKAN',
        cell: ({ row }) => (
          <span className="font-semibold text-green-600 text-xs sm:text-sm">
            {formatCurrency(row.original.jumlah_diajukan)}
          </span>
        ),
      },
      {
        accessorKey: 'jumlah_disetujui',
        header: 'DISETUJUI',
        cell: ({ row }) => (
          <span className="font-medium text-blue-600 text-xs sm:text-sm">
            {row.original.jumlah_disetujui > 0 ? formatCurrency(row.original.jumlah_disetujui) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status_pengajuan',
        header: 'STATUS',
        cell: ({ row }) => {
          const props = getStatusProps(row.original.status_pengajuan);
          return (
            <Badge variant={props.variant} appearance="ghost" className="text-xs">
              <BadgeDot />
              {props.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status_penyaluran',
        header: 'PENYALURAN',
        cell: ({ row }) => {
          const props = getPenyaluranProps(row.original.status_penyaluran);
          return (
            <Badge variant={props.variant} appearance="ghost" className="text-xs">
              <BadgeDot />
              {props.label}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'AKSI',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              mode="icon"
              variant="dim"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              title="Lihat Detail"
              onClick={() => {
                setSelectedClaim(row.original);
                setDetailModalOpen(true);
              }}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              mode="icon"
              variant="dim"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              title="Edit"
              onClick={() => {
                setEditClaimId(row.original.id);
                setEditModalOpen(true);
              }}
              disabled={
                !row.original.id ||
                row.original.status_pengajuan === 'Disalurkan' ||
                row.original.status_pengajuan === 'Selesai'
              }
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              mode="icon"
              variant="destructive"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              title="Hapus"
              onClick={() => {
                setClaimToDelete(row.original);
                setDeleteConfirmOpen(true);
              }}
              disabled={
                row.original.status_pengajuan === 'Disalurkan' ||
                row.original.status_pengajuan === 'Selesai'
              }
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  const table = useReactTable({
    columns,
    data: danaSosialData?.data || [],
    pageCount: danaSosialData?.pagination?.totalPages || 1,
    getRowId: (row: DanaSosial) => row.id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const totalCount = danaSosialData?.pagination?.total || 0;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title="Dana Sosial" description="Kelola dana sosial dan bantuan" />
          <ToolbarActions />
        </Toolbar>
      </Container>

      <Container>
        <Card>
          <CardHeader className="flex-col flex-wrap sm:flex-row items-stretch sm:items-center py-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Cari nama, NIKAP, atau telepon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9 w-full sm:w-64"
                  />
                  {searchQuery.length > 0 && (
                    <Button
                      mode="icon"
                      variant="dim"
                      className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchQuery('')}
                    >
                      ×
                    </Button>
                  )}
                </div>

                {/* Jenis Bantuan Filter */}
                <Select
                  onValueChange={(value) => {
                    setSelectedJenis(value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  value={selectedJenis}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Jenis Bantuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="Medis">Medis</SelectItem>
                    <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="Bencana Alam">Bencana Alam</SelectItem>
                    <SelectItem value="Kematian Keluarga">Kematian Keluarga</SelectItem>
                    <SelectItem value="Jaminan Sosial">Jaminan Sosial</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  value={selectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Dalam Review">Dalam Review</SelectItem>
                    <SelectItem value="Disetujui">Disetujui</SelectItem>
                    <SelectItem value="Ditolak">Ditolak</SelectItem>
                    <SelectItem value="Disalurkan">Disalurkan</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>

                {/* Penyaluran Filter */}
                <Select
                  onValueChange={(value) => {
                    setSelectedPenyaluran(value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  value={selectedPenyaluran}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Penyaluran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Belum Disalurkan">Belum</SelectItem>
                    <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                    <SelectItem value="Sudah Disalurkan">Sudah</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Range Filter */}
                <Input
                  type="date"
                  placeholder="Dari tanggal"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  className="w-full sm:w-auto"
                />
                <Input
                  type="date"
                  placeholder="Sampai tanggal"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  className="w-full sm:w-auto"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button onClick={() => setAddModalOpen(true)} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Ajukan Dana</span>
                  <span className="sm:hidden ml-1">Ajukan</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const columnId = header.column.id;
                      const accessorKey = (header.column.columnDef as any).accessorKey as string;
                      const hideOnMobile = columnId === 'no' || accessorKey === 'created_at' || accessorKey === 'jumlah_disetujui' || accessorKey === 'status_penyaluran';
                      return (
                        <TableHead
                          key={header.id}
                          className={`${hideOnMobile ? 'hidden sm:table-cell' : ''} px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;
                        const accessorKey = (cell.column.columnDef as any).accessorKey as string;
                        const hideOnMobile = columnId === 'no' || accessorKey === 'created_at' || accessorKey === 'jumlah_disetujui' || accessorKey === 'status_penyaluran';
                        return (
                          <TableCell
                            key={cell.id}
                            className={`${hideOnMobile ? 'hidden sm:table-cell' : ''} px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <div className="sm:hidden">
                {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} dari {totalCount}
              </div>
              <div className="hidden sm:block">
                Menampilkan {pagination.pageIndex * pagination.pageSize + 1} -{' '}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} dari {totalCount}{' '}
                data
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                mode="icon"
                variant="dim"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                mode="icon"
                variant="dim"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <div className="text-xs sm:text-sm text-muted-foreground px-2">
                <span className="hidden sm:inline">Halaman </span>{table.getState().pagination.pageIndex + 1}<span className="hidden sm:inline"> dari {table.getPageCount()}</span>
              </div>

              <Button
                mode="icon"
                variant="dim"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                mode="icon"
                variant="dim"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => setPagination({ ...pagination, pageSize: Number(value) })}
              >
                <SelectTrigger className="w-14 sm:w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        </Card>
      </Container>

      {/* Modals */}
      <DanaSosialDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        claim={selectedClaim}
      />
      <DanaSosialFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
        isPending={createMutation.isPending}
        members={membersData?.data || []}
      />
      <DanaSosialFormModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditClaimId(null);
        }}
        onSubmit={handleUpdate}
        claim={editClaimData}
        mode="edit"
        isPending={updateMutation.isPending}
        members={[]}
      />
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setClaimToDelete(null);
        }}
        onConfirm={handleDelete}
        claim={claimToDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Toast Notification */}
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </Fragment>
  );
}
