import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { prefetchPresignedUrls } from '@/hooks/usePresignedUrl';

export function useMembers(params: Record<string, any>) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const res = await api.get('/members', { params });
      const items = (res.data?.data ?? res.data?.items) ?? [];
      const policyEnabled = res.data?.strictPaymentPolicy === true;

      const formattedItems = items.map((m: Record<string, any>) => {
        const latestMembership = (m.latestMembership ?? {}) as Record<string, any>;
        const membershipPlan = m.membershipPlan ?? latestMembership.planName ?? m.plan;
        const membershipStart = m.membershipStart ?? latestMembership.startDate;
        const membershipExpiry = m.membershipExpiry ?? latestMembership.endDate;
        const membershipStatus = m.membershipStatus ?? latestMembership.status ?? m.status;

        const planName = membershipPlan ? String(membershipPlan) : '-';
        const startDate = membershipStart ? String(membershipStart).split('T')[0] : '-';
        const expiryDate = membershipExpiry ? String(membershipExpiry).split('T')[0] : '-';
        const lastVisit = (m.lastVisit ?? m.lastCheckIn) ? String(m.lastVisit ?? m.lastCheckIn).split('T')[0] : '-';

        let calculatedMembershipStatus = membershipPlan ? (membershipStatus ? String(membershipStatus) : null) : 'INACTIVE';
        let calculatedPaymentStatus = m.paymentStatus ? String(m.paymentStatus) : null;

        if (!membershipPlan || planName === '-') {
          calculatedPaymentStatus = calculatedPaymentStatus ?? '-';
        } else {
          if ((!calculatedMembershipStatus || calculatedMembershipStatus === 'ACTIVE') && expiryDate !== '-') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const exp = new Date(expiryDate as string);
            if (exp < today) calculatedMembershipStatus = 'EXPIRED';
            else {
              const diffTime = exp.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              calculatedMembershipStatus = diffDays <= 7 ? 'EXPIRING' : 'ACTIVE';
            }
          } else if (!calculatedMembershipStatus) {
            calculatedMembershipStatus = 'ACTIVE';
          }
          calculatedPaymentStatus = calculatedPaymentStatus ?? '-';
        }

        if (policyEnabled && calculatedMembershipStatus === 'ACTIVE' && calculatedPaymentStatus !== 'PAID') {
          calculatedMembershipStatus = 'PAYMENT_PENDING';
        }

        return {
          id: String(m.id),
          memberId: String(m.memberNumber ?? m.memberId ?? ''),
          firstName: String(m.firstName ?? ''),
          lastName: String(m.lastName ?? ''),
          email: String(m.email ?? ''),
          phone: String(m.phone ?? ''),
          photoUrl: m.photoUrl ?? null,
          status: String(m.status ?? 'INACTIVE'),
          joinDate: String(m.joinDate ?? m.createdAt ?? '').split('T')[0],
          gender: String(m.gender ?? ''),
          dob: String(m.dob ?? ''),
          plan: planName,
          startDate,
          expiryDate,
          trainer: m.trainerName ? String(m.trainerName) : null,
          lastVisit,
          paymentStatus: calculatedPaymentStatus,
          membershipStatus: calculatedMembershipStatus,
          goal: String(m.goal ?? ''),
          experience: String(m.experience ?? ''),
          branchId: m.branchId ? String(m.branchId) : '',
          branch: String(m.branch ?? ''),
          address: String(m.address ?? ''),
          emergency: m.emergency ?? { name: '', phone: '', relation: '' },
          medicalConditions: String(m.medicalConditions ?? 'None'),
          allergies: String(m.allergies ?? 'None'),
          injuries: String(m.injuries ?? 'None'),
        };
      });

      prefetchPresignedUrls(formattedItems.map((m: any) => m.photoUrl ?? null));

      return {
        items: formattedItems,
        total: res.data?.total ?? formattedItems.length,
        strictPaymentPolicy: policyEnabled,
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useMembershipPlans() {
  return useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const res = await api.get('/membership-plans', { params: { pageSize: '50' } });
      const items = res.data?.plans ?? (res.data?.data ?? res.data?.items) ?? [];
      return items.map((plan: Record<string, unknown>) => ({
        id: String(plan.id),
        name: String(plan.name ?? ''),
        price: Number(plan.price ?? 0),
        durationDays: Number(plan.durationDays ?? 30),
      }));
    },
  });
}

export function useMemberMutations() {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: 'ACTIVE' | 'INACTIVE' }) => {
      const res = await api.patch(`/members/${memberId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await api.delete(`/members/${memberId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return { updateStatus, deleteMember };
}
