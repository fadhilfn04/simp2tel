import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalAnggota: number;
  anggotaAktif: number;
  anggotaMeninggal: number;
  totalKlaim: number;
  klaimPending: number;
  totalDicairkan: number;
  totalDanaSosial: number;
  danaSosialPending: number;
  totalDanaSosialDicairkan: number;
}

export interface LatestData {
  anggota: any[];
  klaim: any[];
  sosial: any[];
}

// Fetch dashboard statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dashboard stats');
      }
      return response.json() as Promise<DashboardStats>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Fetch latest data (anggota, klaim, sosial)
export function useLatestData(type: 'anggota' | 'klaim' | 'sosial' | 'both' = 'both', limit: number = 5) {
  return useQuery({
    queryKey: ['latest-data', type, limit],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/latest?type=${type}&limit=${limit}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch latest data');
      }
      return response.json() as Promise<LatestData>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
