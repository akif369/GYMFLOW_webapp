import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { prefetchPresignedUrls } from '@/hooks/usePresignedUrl';
import { formatDateOnly } from '@/lib/date';

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
        const membershipStart = m.membershipStart ?? latestMembership.startAt ?? latestMembership.startDate;
        const membershipExpiry = m.membershipExpiry ?? latestMembership.expiresAt ?? latestMembership.endDate;
        const rawMembershipStatus = String(m.membershipStatus ?? latestMembership.status ?? 'INACTIVE');

        const planName = membershipPlan ? String(membershipPlan) : '-';
        const startDate = formatDateOnly(membershipStart, String(m.membershipTimezone ?? latestMembership.timezone ?? 'Asia/Kolkata'));
        const expiryDate = formatDateOnly(membershipExpiry, String(m.membershipTimezone ?? latestMembership.timezone ?? 'Asia/Kolkata'));
        const lastVisit = formatDateOnly(m.lastVisit ?? m.lastCheckIn);

        const memberIsInactive = ['INACTIVE', 'ARCHIVED'].includes(String(m.status ?? ''));
        const calculatedMembershipStatus = memberIsInactive || !membershipPlan
          ? 'INACTIVE'
          : ['EXPIRED', 'CANCELLED'].includes(rawMembershipStatus)
            ? 'EXPIRED'
            : rawMembershipStatus;
        const isExpiringSoon = calculatedMembershipStatus === 'ACTIVE' && m.membershipExpiringSoon === true;
        const calculatedPaymentStatus = m.paymentStatus ? String(m.paymentStatus) : '-';

        const displayMembershipStatus = policyEnabled && calculatedMembershipStatus === 'ACTIVE' && calculatedPaymentStatus !== 'PAID'
          ? 'PAYMENT_PENDING'
          : isExpiringSoon
            ? 'EXPIRING'
            : rawMembershipStatus === 'CANCELLED' && !memberIsInactive
              ? 'CANCELLED'
            : calculatedMembershipStatus;

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
          displayMembershipStatus,
          isExpiringSoon,
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
        total: res.data?.pagination?.total ?? res.data?.total ?? formattedItems.length,
        summary: res.data?.summary ?? null,
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
