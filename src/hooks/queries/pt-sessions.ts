import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePtSessions(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['pt-sessions', params],
    queryFn: async () => {
      const res = await api.get('/pt/sessions', { params });
      return res.data;
    },
  });
}

export function useTodayPtSessions() {
  return useQuery({
    queryKey: ['pt-sessions', 'today'],
    queryFn: async () => {
      const res = await api.get('/pt/sessions/today');
      return res.data;
    },
    refetchInterval: 60000,
  });
}

export function usePtPackages() {
  return useQuery({
    queryKey: ['pt-packages'],
    queryFn: async () => {
      const res = await api.get('/pt/packages');
      return res.data;
    },
  });
}

export function usePtMutations() {
  const queryClient = useQueryClient();

  const bookSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/pt/sessions', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await api.post(`/pt/sessions/${id}/complete`, { notes });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-sessions'] }),
  });

  const cancelSession = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.post(`/pt/sessions/${id}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-sessions'] }),
  });

  const missSession = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/pt/sessions/${id}/miss`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-sessions'] }),
  });

  return { bookSession, completeSession, cancelSession, missSession };
}

export function usePtPackageMutations() {
  const queryClient = useQueryClient();

  const addPackage = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/pt/packages', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-packages'] }),
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/pt/packages/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-packages'] }),
  });

  return { addPackage, updatePackage };
}
