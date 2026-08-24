import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePayments(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const res = await api.get('/payments', { params });
      return res.data;
    },
  });
}

export function useInvoices(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const res = await api.get('/invoices', { params });
      return res.data;
    },
  });
}

export function usePaymentMutations() {
  const queryClient = useQueryClient();

  const recordPayment = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/payments', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  const refundPayment = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/payments/${id}/refund`, { reason });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  return { recordPayment, refundPayment };
}

export function useInvoiceMutations() {
  const queryClient = useQueryClient();

  const generateInvoice = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/invoices/generate', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const sendInvoice = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/invoices/${id}/whatsapp`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  return { generateInvoice, sendInvoice };
}
