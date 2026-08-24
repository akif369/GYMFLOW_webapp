import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTrainers(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['trainers', params],
    queryFn: async () => {
      const res = await api.get('/trainers', { params });
      return res.data;
    },
  });
}
export function useAssignedMembers(trainerId: string | null) {
  return useQuery({
    queryKey: ['trainers', trainerId, 'members'],
    queryFn: async () => {
      if (!trainerId) return null;
      const res = await api.get(`/trainers/${trainerId}/members`);
      return res.data;
    },
    enabled: !!trainerId,
  });
}

export function useTrainerMutations() {
  const queryClient = useQueryClient();

  const addTrainer = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/trainers', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainers'] }),
  });

  const updateTrainer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/trainers/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainers'] }),
  });

  const updateTrainerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/trainers/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainers'] }),
  });

  const assignMembers = useMutation({
    mutationFn: async ({ id, memberIds }: { id: string; memberIds: string[] }) => {
      const res = await api.post(`/trainers/${id}/assign-members`, { memberIds });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', variables.id, 'members'] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ trainerId, memberId }: { trainerId: string; memberId: string }) => {
      const res = await api.delete(`/trainers/${trainerId}/members/${memberId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainers', variables.trainerId, 'members'] });
    },
  });

  return { addTrainer, updateTrainer, updateTrainerStatus, assignMembers, removeMember };
}
