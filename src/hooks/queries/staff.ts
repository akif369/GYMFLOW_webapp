import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useStaff(params: Record<string, any>) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: async () => {
      const res = await api.get('/staff', { params });
      const items = (res.data?.data ?? res.data?.items) ?? (res.data?.staff) ?? [];
      
      return items.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || String(s.name ?? ''),
        email: String(s.email ?? ''),
        phone: String(s.phone ?? '').replace(/^\+91/, ''),
        role: String(s.role ?? ''),
        status: String(s.status ?? 'ACTIVE'),
        permissions: Array.isArray(s.permissions) ? s.permissions.map(String) : [],
        joinDate: String(s.joinDate ?? s.createdAt ?? '').split('T')[0],
        branch: String(s.branch ?? ''),
        branchId: String(s.branchId ?? ''),
      }));
    },
    staleTime: 30 * 1000,
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();

  const inviteStaff = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post('/staff/invite', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaffInfo = useMutation({
    mutationFn: async ({ staffId, data }: { staffId: string; data: Record<string, any> }) => {
      const res = await api.patch(`/staff/${staffId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaffPermissions = useMutation({
    mutationFn: async ({ staffId, permissions }: { staffId: string; permissions: string[] }) => {
      const res = await api.patch(`/staff/${staffId}/permissions`, { permissions });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaffStatus = useMutation({
    mutationFn: async ({ staffId, status }: { staffId: string; status: 'ACTIVE' | 'INACTIVE' }) => {
      const res = await api.patch(`/staff/${staffId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.post(`/staff/${staffId}/reset-password`);
      return res.data;
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete(`/staff/${staffId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  return { inviteStaff, updateStaffInfo, updateStaffPermissions, updateStaffStatus, resetPassword, deleteStaff };
}
