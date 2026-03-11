import { useQuery } from '@tanstack/react-query';

interface NeracaResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    debtToAssetRatio: number;
    debtToEquityRatio: number;
  };
  assetBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  latestBalance: {
    totalAset: number;
    totalKewajiban: number;
    totalEkuitas: number;
  } | null;
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch balance sheet data
export function useNeraca(params?: {
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
    queryKey: ['neraca', params],
    queryFn: async () => {
      const response = await fetch(`/api/keuangan/neraca${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch neraca');
      }
      return response.json() as Promise<NeracaResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
