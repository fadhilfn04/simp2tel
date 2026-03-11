import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PembayaranSumbangan, CreatePembayaranSumbanganInput, UpdatePembayaranSumbanganInput } from '@/lib/supabase';

// API response types
interface PembayaranSumbanganListResponse {
  data: PembayaranSumbangan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PembayaranSumbanganResponse {
  data: PembayaranSumbangan;
  message?: string;
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch all contribution payments with filters
export function usePembayaranSumbanganList(params: {
  search?: string;
  status_pembayaran?: string;
  tipe_sumbangan?: string;
  tanggal_transaksi_from?: string;
  tanggal_transaksi_to?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.status_pembayaran && params.status_pembayaran !== 'all') {
    queryParams.set('status_pembayaran', params.status_pembayaran);
  }
  if (params.tipe_sumbangan && params.tipe_sumbangan !== 'all') {
    queryParams.set('tipe_sumbangan', params.tipe_sumbangan);
  }
  if (params.tanggal_transaksi_from) {
    queryParams.set('tanggal_transaksi_from', params.tanggal_transaksi_from);
  }
  if (params.tanggal_transaksi_to) {
    queryParams.set('tanggal_transaksi_to', params.tanggal_transaksi_to);
  }
  queryParams.set('page', String(params.page || 1));
  queryParams.set('limit', String(params.limit || 10));

  return useQuery({
    queryKey: ['pembayaranSumbangan', params],
    queryFn: async () => {
      const response = await fetch(`/api/pembayaran-sumbangan?${queryParams.toString()}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch pembayaran sumbangan');
      }
      return response.json() as Promise<PembayaranSumbanganListResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch single contribution payment by ID
export function usePembayaranSumbangan(id: string) {
  return useQuery({
    queryKey: ['pembayaranSumbangan', id],
    queryFn: async () => {
      const response = await fetch(`/api/pembayaran-sumbangan/${id}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch pembayaran sumbangan');
      }
      const result: PembayaranSumbanganResponse = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}

// Create new contribution payment
export function useCreatePembayaranSumbangan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePembayaranSumbanganInput) => {
      const response = await fetch('/api/pembayaran-sumbangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to create pembayaran sumbangan');
      }

      return response.json() as Promise<PembayaranSumbanganResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pembayaranSumbangan'] });
    },
  });
}

// Update contribution payment
export function useUpdatePembayaranSumbangan(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePembayaranSumbanganInput) => {
      const response = await fetch(`/api/pembayaran-sumbangan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to update pembayaran sumbangan');
      }

      return response.json() as Promise<PembayaranSumbanganResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pembayaranSumbangan'] });
      queryClient.invalidateQueries({ queryKey: ['pembayaranSumbangan', id] });
    },
  });
}

// Delete contribution payment
export function useDeletePembayaranSumbangan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/pembayaran-sumbangan/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to delete pembayaran sumbangan');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pembayaranSumbangan'] });
    },
  });
}
