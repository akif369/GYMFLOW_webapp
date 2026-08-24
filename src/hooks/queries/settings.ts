import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrg() {
  return useQuery({
    queryKey: ['org'],
    queryFn: async () => {
      const res = await api.get('/org');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSettingMutations() {
  const queryClient = useQueryClient();

  const updateSetting = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: any }) => {
      const res = await api.patch(`/settings/${key}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const updateOrg = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/org', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org'] }),
  });

  return { updateSetting, updateOrg };
}
