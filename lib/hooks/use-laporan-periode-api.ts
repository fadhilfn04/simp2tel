import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LaporanPeriode, CreateLaporanPeriodeInput, UpdateLaporanPeriodeInput } from '@/lib/supabase';

// API response types
interface LaporanPeriodeListResponse {
  data: LaporanPeriode[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface LaporanPeriodeResponse {
  data: LaporanPeriode;
  message?: string;
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch all period reports with filters
export function useLaporanPeriodeList(params: {
  tipe_laporan?: string;
  status_laporan?: string;
  year?: string;
  month?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.tipe_laporan && params.tipe_laporan !== 'all') {
    queryParams.set('tipe_laporan', params.tipe_laporan);
  }
  if (params.status_laporan && params.status_laporan !== 'all') {
    queryParams.set('status_laporan', params.status_laporan);
  }
  if (params.year) {
    queryParams.set('year', params.year);
  }
  if (params.month && params.month !== 'all') {
    queryParams.set('month', params.month);
  }
  queryParams.set('page', String(params.page || 1));
  queryParams.set('limit', String(params.limit || 10));

  return useQuery({
    queryKey: ['laporanPeriode', params],
    queryFn: async () => {
      const response = await fetch(`/api/laporan-periode?${queryParams.toString()}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch laporan periode');
      }
      return response.json() as Promise<LaporanPeriodeListResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch single period report by ID
export function useLaporanPeriode(id: string) {
  return useQuery({
    queryKey: ['laporanPeriode', id],
    queryFn: async () => {
      const response = await fetch(`/api/laporan-periode/${id}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch laporan periode');
      }
      const result: LaporanPeriodeResponse = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}

// Create new period report
export function useCreateLaporanPeriode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLaporanPeriodeInput) => {
      const response = await fetch('/api/laporan-periode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to create laporan periode');
      }

      return response.json() as Promise<LaporanPeriodeResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporanPeriode'] });
    },
  });
}

// Update period report
export function useUpdateLaporanPeriode(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLaporanPeriodeInput) => {
      const response = await fetch(`/api/laporan-periode/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to update laporan periode');
      }

      return response.json() as Promise<LaporanPeriodeResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporanPeriode'] });
      queryClient.invalidateQueries({ queryKey: ['laporanPeriode', id] });
    },
  });
}

// Delete period report
export function useDeleteLaporanPeriode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/laporan-periode/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to delete laporan periode');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporanPeriode'] });
    },
  });
}
