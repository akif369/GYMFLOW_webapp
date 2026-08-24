import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useLeads(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const res = await api.get('/leads', { params });
      return res.data;
    },
  });
}
