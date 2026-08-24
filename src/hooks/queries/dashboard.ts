import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboard(params: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: async () => {
      const res = await api.get('/dashboard', { params });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
