'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/toolbar';
import { Container } from '@/components/common/container';
import { ProtectedRoute } from '@/components/rbac/protected-route';
import { PERMISSIONS } from '@/lib/rbac';
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
  Eye,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Calendar,
  Filter,
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
  usePembayaranSumbanganList,
  useCreatePembayaranSumbangan,
  useDeletePembayaranSumbangan,
  useUpdatePembayaranSumbangan,
  usePembayaranSumbangan,
  useVerifyPembayaran,
} from '@/lib/hooks/use-pembayaran-sumbangan-api';
import { PembayaranSumbangan, CreatePembayaranSumbanganInput } from '@/lib/supabase';
import { PembayaranFormModal } from '@/components/pembayaran/PembayaranFormModal';
import { PembayaranDetailModal } from '@/components/pembayaran/PembayaranDetailModal';
import { PembayaranVerifyModal } from '@/components/pembayaran/PembayaranVerifyModal';
import { useAnggotaList } from '@/lib/hooks/use-anggota-api';
import { useSession } from 'next-auth/react';

export default function MekanismeIuranPage() {
  const { data: session } = useSession();
  
  // State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTipe, setSelectedTipe] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal states
  const [selectedPembayaran, setSelectedPembayaran] = useState<PembayaranSumbangan | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPembayaranId, setEditPembayaranId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pembayaranToDelete, setPembayaranToDelete] = useState<PembayaranSumbangan | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'success' });

  // API hooks
  const { data: pembayaranData, isLoading } = usePembayaranSumbanganList({
    search: searchQuery,
    status_pembayaran: selectedStatus,
    tipe_sumbangan: selectedTipe,
    tanggal_transaksi_from: dateFrom,
    tanggal_transaksi_to: dateTo,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  // Fetch anggota list for form dropdown
  const { data: anggotaData } = useAnggotaList({
    page: 1,
    limit: 1000,
  });

  const { data: editPembayaranData } = usePembayaranSumbangan(editPembayaranId || '');
  const createMutation = useCreatePembayaranSumbangan();
  const updateMutation = useUpdatePembayaranSumbangan(editPembayaranId || '');
  const deleteMutation = useDeletePembayaranSumbangan();
  const verifyMutation = useVerifyPembayaran(selectedPembayaran?.id || '');

  // Helper functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" appearance="ghost" className="text-xs"><BadgeDot />Sudah Dibayar</Badge>;
      case 'failed':
        return <Badge variant="destructive" appearance="ghost" className="text-xs"><BadgeDot />Gagal</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" appearance="ghost" className="text-xs"><BadgeDot />Pending</Badge>;
    }
  };

  const getTipeSumbanganLabel = (tipe: string) => {
    switch (tipe) {
      case 'sumbangan_bulanan': return 'Bulanan';
      case 'sumbangan_kematian': return 'Kematian';
      case 'sumbangan_khusus': return 'Khusus';
      case 'sumbangan_investasi': return 'Investasi';
      case 'sumbangan_lainnya': return 'Lainnya';
      default: return tipe;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getErrorMessage = (error: any) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Terjadi kesalahan'
    );
  };

  // Event handlers
  const handleCreate = async (data: CreatePembayaranSumbanganInput) => {
    try {
      await createMutation.mutateAsync(data);
      showToast('Pembayaran sumbangan berhasil ditambahkan', 'success');
      setAddModalOpen(false);
    } catch (error: any) {
      console.error('Error creating pembayaran:', error);
      setAddModalOpen(false);
      showToast(
        `Gagal menambahkan pembayaran: ${getErrorMessage(error)}`,
        'error'
      );
      throw error;
    }
  };

  const handleUpdate = async (data: CreatePembayaranSumbanganInput) => {
    try {
      await updateMutation.mutateAsync(data);
      showToast('Pembayaran sumbangan berhasil diperbarui', 'success');
      setEditModalOpen(false);
      setEditPembayaranId(null);
    } catch (error: any) {
      console.error('Error updating pembayaran:', error);
      setEditModalOpen(false);
      setEditPembayaranId(null);
      showToast(
        `Gagal update pembayaran: ${getErrorMessage(error)}`,
        'error'
      );
      throw error;
    }
  };

  const handleDelete = async () => {
    if (pembayaranToDelete) {
      try {
        await deleteMutation.mutateAsync(pembayaranToDelete.id);
        showToast('Pembayaran sumbangan berhasil dihapus', 'success');
        setDeleteConfirmOpen(false);
        setPembayaranToDelete(null);
      } catch (error) {
        console.error('Error deleting pembayaran:', error);
        showToast('Gagal menghapus pembayaran sumbangan', 'error');
      }
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({
        status_pembayaran: verifyModalOpen ? 'paid' : 'failed',
        diverifikasi_oleh: session?.user?.name || 'Admin',
        catatan_verifikasi: '',
      });
      showToast('Pembayaran berhasil diverifikasi', 'success');
      setVerifyModalOpen(false);
      setSelectedPembayaran(null);
    } catch (error) {
      console.error('Error verifying pembayaran:', error);
      showToast('Gagal memverifikasi pembayaran', 'error');
    }
  };

  // Table columns
  const columns = useMemo<ColumnDef<PembayaranSumbangan>[]>(
    () => [
      {
        accessorKey: 'no',
        header: 'NO',
        cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
      },
      {
        accessorKey: 'nomor_referensi',
        header: 'REFERENSI',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.nomor_referensi || '-'}</span>
        ),
      },
      {
        accessorKey: 'nama_anggota',
        header: 'NAMA ANGGOTA',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">{row.original.nama_anggota}</div>
            <div className="text-xs text-gray-500">{row.original.nik}</div>
          </div>
        ),
      },
      {
        accessorKey: 'tipe_sumbangan',
        header: 'TIPE',
        cell: ({ row }) => (
          <Badge variant="secondary" appearance="ghost" className="text-xs">
            {getTipeSumbanganLabel(row.original.tipe_sumbangan)}
          </Badge>
        ),
      },
      {
        accessorKey: 'tanggal_transaksi',
        header: 'TANGGAL',
        cell: ({ row }) => {
          const date = new Date(row.original.tanggal_transaksi);
          return <span className="text-xs">{date.toLocaleDateString('id-ID')}</span>;
        },
      },
      {
        accessorKey: 'jumlah_pembayaran',
        header: 'JUMLAH',
        cell: ({ row }) => (
          <span className="font-medium text-sm">{formatCurrency(row.original.jumlah_pembayaran)}</span>
        ),
      },
      {
        accessorKey: 'metode_pembayaran',
        header: 'METODE',
        cell: ({ row }) => <span className="text-xs">{row.original.metode_pembayaran || '-'}</span>,
      },
      {
        accessorKey: 'status_pembayaran',
        header: 'STATUS',
        cell: ({ row }) => getStatusBadge(row.original.status_pembayaran),
      },
      {
        id: 'actions',
        header: 'AKSI',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              mode="icon"
              variant="dim"
              size="sm"
              className="h-7 w-7"
              title="Lihat Detail"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPembayaran(row.original);
                setDetailModalOpen(true);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              mode="icon"
              variant="dim"
              size="sm"
              className="h-7 w-7"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                setEditPembayaranId(row.original.id);
                setEditModalOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            {row.original.status_pembayaran === 'pending' && (
              <Button
                mode="icon"
                variant="primary"
                size="sm"
                className="h-7 w-7"
                title="Verifikasi"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPembayaran(row.original);
                  setVerifyModalOpen(true);
                }}
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            <Button
              mode="icon"
              variant="destructive"
              size="sm"
              className="h-7 w-7"
              title="Hapus"
              onClick={(e) => {
                e.stopPropagation();
                setPembayaranToDelete(row.original);
                setDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  const table = useReactTable({
    columns,
    data: pembayaranData?.data || [],
    pageCount: pembayaranData?.pagination?.totalPages || 1,
    getRowId: (row: PembayaranSumbangan) => row.id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const totalCount = pembayaranData?.pagination?.total || 0;

  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_IURAN}>
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading title="Mekanisme Iuran" description="Kelola pembayaran sumbangan anggota" />
            <ToolbarActions />
          </Toolbar>
        </Container>

        {/* Summary Cards */}
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Total Pembayaran</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(pembayaranData?.data?.reduce((sum, p) => sum + (p.jumlah_pembayaran || 0), 0) || 0)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {pembayaranData?.data?.filter(p => p.status_pembayaran === 'pending').length || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Sudah Dibayar</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(pembayaranData?.data?.filter(p => p.status_pembayaran === 'paid').reduce((sum, p) => sum + (p.jumlah_pembayaran || 0), 0) || 0)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Bulan Ini</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(pembayaranData?.data?.filter(p => {
                  const date = new Date(p.tanggal_transaksi);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).reduce((sum, p) => sum + (p.jumlah_pembayaran || 0), 0) || 0)}
              </div>
            </Card>
          </div>
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
                      placeholder="Cari nama, NIK, atau referensi..."
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

                  {/* Filters */}
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Sudah Dibayar</SelectItem>
                      <SelectItem value="failed">Gagal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(value) => {
                      setSelectedTipe(value);
                      setPagination({ ...pagination, pageIndex: 0 });
                    }}
                    value={selectedTipe}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="sumbangan_bulanan">Bulanan</SelectItem>
                      <SelectItem value="sumbangan_kematian">Kematian</SelectItem>
                      <SelectItem value="sumbangan_khusus">Khusus</SelectItem>
                      <SelectItem value="sumbangan_investasi">Investasi</SelectItem>
                      <SelectItem value="sumbangan_lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full sm:w-40"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button onClick={() => setAddModalOpen(true)} className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Tambah Pembayaran</span>
                    <span className="sm:hidden ml-1">Tambah</span>
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
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
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
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-sm"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
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
                <Button mode="icon" variant="dim" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="h-8 w-8 sm:h-9 sm:w-9">
                  <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button mode="icon" variant="dim" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8 sm:h-9 sm:w-9">
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <div className="text-xs sm:text-sm text-muted-foreground px-2">
                  <span className="hidden sm:inline">Halaman </span>{table.getState().pagination.pageIndex + 1}<span className="hidden sm:inline"> dari {table.getPageCount()}</span>
                </div>

                <Button mode="icon" variant="dim" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8 sm:h-9 sm:w-9">
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button mode="icon" variant="dim" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="h-8 w-8 sm:h-9 sm:w-9">
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
        <PembayaranDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedPembayaran(null);
          }}
          pembayaran={selectedPembayaran}
        />
        <PembayaranFormModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreate}
          mode="create"
          isPending={createMutation.isPending}
          anggotaList={anggotaData?.data || []}
        />
        <PembayaranFormModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditPembayaranId(null);
          }}
          onSubmit={handleUpdate}
          mode="edit"
          pembayaran={editPembayaranData}
          isPending={updateMutation.isPending}
          anggotaList={anggotaData?.data || []}
        />
        <PembayaranVerifyModal
          open={verifyModalOpen}
          onClose={() => {
            setVerifyModalOpen(false);
            setSelectedPembayaran(null);
          }}
          onVerify={handleVerify}
          pembayaran={selectedPembayaran}
          isPending={verifyMutation.isPending}
          userName={session?.user?.name}
        />

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {toast.message}
          </div>
        )}
      </Fragment>
    </ProtectedRoute>
  );
}
