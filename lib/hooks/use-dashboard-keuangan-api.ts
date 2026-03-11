import { useQuery } from '@tanstack/react-query';

interface DashboardResponse {
  overview: {
    totalAset: number;
    totalDana: number;
    anggotaAktif: number;
    totalReports: number;
    pendingReports: number;
  };
  ringkasanKeuangan: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
  arusKas: {
    kasMasuk: number;
    kasKeluar: number;
    netCashFlow: number;
  };
  labaRugi: {
    pendapatan: number;
    beban: number;
    labaBersih: number;
  };
  neraca: {
    totalAset: number;
    totalKewajiban: number;
    totalEkuitas: number;
  };
  pembayaranSumbangan: {
    totalTerbayar: number;
    totalTertunda: number;
    jumlahTransaksi: number;
  };
  danaKematian: {
    totalDana: number;
    klaimDibayar: number;
    sisaDana: number;
  };
  danaSosial: {
    totalDana: number;
    bantuanDiberikan: number;
    sisaDana: number;
  };
  laporanPeriode: {
    totalReports: number;
    pendingReports: number;
  };
}

interface ApiError {
  error: string;
  details?: string;
}

// Fetch dashboard data
export function useDashboardKeuangan(params?: {
  period?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.period) {
    queryParams.set('period', params.period);
  }

  return useQuery({
    queryKey: ['dashboardKeuangan', params],
    queryFn: async () => {
      const response = await fetch(`/api/keuangan/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to fetch dashboard data');
      }
      return response.json() as Promise<DashboardResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
