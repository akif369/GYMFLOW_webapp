import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
export function useBranchMutations() {
  const queryClient = useQueryClient();

  const addBranch = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/branches', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  const updateBranch = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/branches/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  return { addBranch, updateBranch };
}
