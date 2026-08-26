import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BiometricDevice {
  id: string;
  organizationId: string;
  branchId: string;
  serialNumber: string;
  deviceName: string;
  deviceType?: string;
  ipAddress?: string;
  firmware?: string;
  protocol: string;
  purpose: 'ENTRY' | 'EXIT' | 'VIDEO' | 'OTHER';
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  lastSeenAt?: string;
  createdAt: string;
}

export interface BiometricIdentity {
  id: string;
  memberId: string;
  memberName?: string;
  memberNumber?: string;
  memberStatus?: string;
  deviceId: string;
  deviceName?: string;
  deviceSerial?: string;
  deviceUserId: string;
  accessGroup: number; // 1 = Allowed / Active, 99 = Denied
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  lastSyncedAt?: string;
  createdAt: string;
}

export interface ReconcileResult {
  totalMembersChecked: number;
  devicesCount: number;
  commandsQueued: number;
  group1ActiveCount: number;
  group99DeniedCount: number;
  alreadyInSyncCount: number;
}

export function useBiometricDevices() {
  return useQuery({
    queryKey: ['biometric-devices'],
    queryFn: async () => {
      const { data } = await api.get('/biometrics');
      return data.data as BiometricDevice[];
    },
  });
}

export function useRegisterBiometricDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { branchId: string; serialNumber: string; deviceName: string; deviceType?: string; purpose?: string }) => {
      const { data } = await api.post('/biometrics', payload);
      return data.data as BiometricDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
  });
}

export function useDeleteBiometricDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      await api.delete(`/biometrics/${deviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] });
    },
  });
}

export function useDeleteBiometricIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identityId: string) => {
      await api.delete(`/biometrics/identities/${identityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-identities'] });
    },
  });
}

export function useSyncMemberToDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { memberId: string; branchId: string; pin: string; name: string; accessGroup?: number }) => {
      const { data } = await api.post('/biometrics/sync', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-identities'] });
    },
  });
}

export function useSyncMemberAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data } = await api.post(`/biometrics/sync-member/${memberId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-identities'] });
    },
  });
}

export function useReconcileBiometrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { branchId?: string }) => {
      const { data } = await api.post('/biometrics/reconcile', payload || {});
      return data as ReconcileResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-identities'] });
    },
  });
}

export function useBiometricIdentities() {
  return useQuery({
    queryKey: ['biometric-identities'],
    queryFn: async () => {
      const { data } = await api.get('/biometrics/identities');
      return data.data as BiometricIdentity[];
    },
  });
}
