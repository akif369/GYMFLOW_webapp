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
