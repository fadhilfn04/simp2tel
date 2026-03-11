import { useQuery } from '@tanstack/react-query';

interface RingkasanKeuanganResponse {
  overview: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
  revenueBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    category: string;
    reference: string | null;
  }>;
  danaKematian: {
    total: number;
    klaimPaid: number;
    remaining: number;
  };
  danaSosial: {
    total: number;
    bantuanGiven: number;
    remaining: number;
  };
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch financial summary
export function useRingkasanKeuangan(params?: {
  date_from?: string;
  date_to?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.date_from) queryParams.set('date_from', params.date_from);
  if (params?.date_to) queryParams.set('date_to', params.date_to);

  return useQuery({
    queryKey: ['ringkasanKeuangan', params],
    queryFn: async () => {
      const response = await fetch(`/api/keuangan/ringkasan${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch ringkasan keuangan');
      }
      return response.json() as Promise<RingkasanKeuanganResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
