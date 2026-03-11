import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArusKas, CreateArusKasInput, UpdateArusKasInput } from '@/lib/supabase';

// API response types
interface ArusKasListResponse {
  data: ArusKas[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ArusKasResponse {
  data: ArusKas;
  message?: string;
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch all cash flow transactions with filters
export function useArusKasList(params: {
  search?: string;
  jenis_transaksi?: string;
  kategori_transaksi?: string;
  tanggal_transaksi_from?: string;
  tanggal_transaksi_to?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.jenis_transaksi && params.jenis_transaksi !== 'all') {
    queryParams.set('jenis_transaksi', params.jenis_transaksi);
  }
  if (params.kategori_transaksi && params.kategori_transaksi !== 'all') {
    queryParams.set('kategori_transaksi', params.kategori_transaksi);
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
    queryKey: ['arusKas', params],
    queryFn: async () => {
      const response = await fetch(`/api/arus-kas?${queryParams.toString()}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch arus kas');
      }
      return response.json() as Promise<ArusKasListResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch single cash flow transaction by ID
export function useArusKas(id: string) {
  return useQuery({
    queryKey: ['arusKas', id],
    queryFn: async () => {
      const response = await fetch(`/api/arus-kas/${id}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch arus kas');
      }
      const result: ArusKasResponse = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}

// Create new cash flow transaction
export function useCreateArusKas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateArusKasInput) => {
      const response = await fetch('/api/arus-kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to create arus kas');
      }

      return response.json() as Promise<ArusKasResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arusKas'] });
    },
  });
}

// Update cash flow transaction
export function useUpdateArusKas(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateArusKasInput) => {
      const response = await fetch(`/api/arus-kas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to update arus kas');
      }

      return response.json() as Promise<ArusKasResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arusKas'] });
      queryClient.invalidateQueries({ queryKey: ['arusKas', id] });
    },
  });
}

// Delete cash flow transaction
export function useDeleteArusKas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/arus-kas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to delete arus kas');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arusKas'] });
    },
  });
}
