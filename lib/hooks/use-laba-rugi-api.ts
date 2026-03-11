import { useQuery } from '@tanstack/react-query';

interface LabaRugiResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    avgProfitMargin: number;
    profitMargin: number;
  };
  revenueBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch income statement data
export function useLabaRugi(params?: {
  date_from?: string;
  date_to?: string;
  tipe_laporan?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.date_from) queryParams.set('date_from', params.date_from);
  if (params?.date_to) queryParams.set('date_to', params.date_to);
  if (params?.tipe_laporan && params.tipe_laporan !== 'all') {
    queryParams.set('tipe_laporan', params.tipe_laporan);
  }
  queryParams.set('page', String(params?.page || 1));
  queryParams.set('limit', String(params?.limit || 10));

  return useQuery({
    queryKey: ['labaRugi', params],
    queryFn: async () => {
      const response = await fetch(`/api/keuangan/laba-rugi${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch laba rugi');
      }
      return response.json() as Promise<LabaRugiResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
