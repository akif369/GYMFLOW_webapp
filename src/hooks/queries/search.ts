import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { members: [], payments: [] };
      const res = await api.get('/search', { params: { q: query } });
      return res.data;
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}
