import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DanaSosial, CreateDanaSosialInput, UpdateDanaSosialInput, DanaSosialFilter } from '@/lib/supabase';

const API_BASE = '/api/dana-sosial';

// Build query string from filter object
const buildQueryString = (filter: DanaSosialFilter): string => {
  const params = new URLSearchParams();

  if (filter.search) params.append('search', filter.search);
  if (filter.jenis_bantuan && filter.jenis_bantuan !== 'all') params.append('jenis_bantuan', filter.jenis_bantuan);
  if (filter.status_pengajuan && filter.status_pengajuan !== 'all') params.append('status_pengajuan', filter.status_pengajuan);
  if (filter.status_penyaluran && filter.status_penyaluran !== 'all') params.append('status_penyaluran', filter.status_penyaluran);
  if (filter.tanggal_pengajuan_from) params.append('tanggal_pengajuan_from', filter.tanggal_pengajuan_from);
  if (filter.tanggal_pengajuan_to) params.append('tanggal_pengajuan_to', filter.tanggal_pengajuan_to);
  params.append('page', String(filter.page || 1));
  params.append('limit', String(filter.limit || 10));

  return params.toString();
};

// Fetch dana sosial list
export function useDanaSosialList(filter: DanaSosialFilter = {}) {
  const queryString = buildQueryString(filter);

  return useQuery({
    queryKey: ['dana-sosial', filter],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}?${queryString}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dana sosial');
      }
      return response.json();
    },
  });
}

// Fetch single dana sosial by ID
export function useDanaSosial(id: string) {
  return useQuery({
    queryKey: ['dana-sosial', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dana sosial');
      }
      return response.json() as Promise<DanaSosial>;
    },
    enabled: !!id,
  });
}

// Create dana sosial
export function useCreateDanaSosial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDanaSosialInput) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dana sosial');
      }

      return response.json() as Promise<DanaSosial>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dana-sosial'] });
    },
  });
}

// Update dana sosial
export function useUpdateDanaSosial(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDanaSosialInput) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update dana sosial');
      }

      return response.json() as Promise<DanaSosial>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dana-sosial'] });
      queryClient.invalidateQueries({ queryKey: ['dana-sosial', id] });
    },
  });
}

// Delete dana sosial
export function useDeleteDanaSosial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete dana sosial');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dana-sosial'] });
    },
  });
}
