import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAttendanceInside() {
  return useQuery({
    queryKey: ['attendance', 'inside'],
    queryFn: async () => {
      const res = await api.get('/attendance/currently-inside');
      const items = res.data?.members ?? (res.data?.data ?? res.data?.items) ?? [];
      return items.map((m: Record<string, unknown>) => ({
        id: String(m.memberId ?? ''), // member UUID -> used for checkout
        name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || String(m.memberName ?? ''),
        memberId: String(m.memberNumber ?? ''),
        plan: String(m.planName ?? m.plan ?? ''),
        checkIn: String(m.checkInAt ?? m.checkInTime ?? ''), // Return raw iso
        trainer: String(m.trainerName ?? ''),
        attendanceLogId: String(m.id ?? ''),
        membershipStatus: String(m.membershipStatus ?? ''),
      }));
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

function toISTTime(utcIso: string): string {
  if (!utcIso) return '';
  return new Date(utcIso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toISTDate(utcIso: string): string {
  if (!utcIso) return '';
  return new Date(utcIso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA → YYYY-MM-DD
}

export function useAttendanceHistory(params: Record<string, any>) {
  return useInfiniteQuery({
    queryKey: ['attendance', 'history', params],
    queryFn: async ({ pageParam = undefined }) => {
      const p = { ...params };
      if (pageParam) p.cursor = pageParam;
      const res = await api.get('/attendance', { params: p });
      const items = res.data?.items ?? (res.data?.data ?? []);
      const mapped = items.map((l: Record<string, any>) => ({
        id: String(l.id),
        member: `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || String(l.memberName ?? ''),
        memberId: String(l.memberNumber ?? l.memberId ?? ''),
        date: toISTDate(String(l.checkInAt ?? l.date ?? '')),
        checkIn: toISTTime(String(l.checkInAt ?? '')),
        checkOut: l.checkOutAt ? toISTTime(String(l.checkOutAt)) : null,
        duration: l.durationMinutes
          ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m`
          : 'Inside',
        method: String(l.checkInMethod ?? l.method ?? 'MANUAL'),
      }));
      return {
        items: mapped,
        nextCursor: res.data?.pagination?.nextCursor ?? res.data?.nextCursor ?? null,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function usePeakHours() {
  return useQuery({
    queryKey: ['attendance', 'peak-hours'],
    queryFn: async () => {
      const res = await api.get('/attendance/analytics/peak-hours');
      const rows = res.data?.peakHours ?? res.data?.rows ?? [];
      const maxCount = Math.max(...rows.map((r: Record<string, unknown>) => Number(r.count ?? 0)), 1);
      return rows.map((r: Record<string, unknown>) => ({
        hour: String(r.hour ?? r.hourLabel ?? ''),
        count: Number(r.count ?? 0),
        pct: Math.round((Number(r.count ?? 0) / maxCount) * 100),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceMutations() {
  const queryClient = useQueryClient();

  const checkIn = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      const res = await api.post('/attendance/check-in', { memberId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const checkOut = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      const res = await api.post('/attendance/check-out', { memberId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  return { checkIn, checkOut };
}
