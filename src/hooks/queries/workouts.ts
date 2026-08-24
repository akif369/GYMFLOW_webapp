import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useExercises(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['exercises', params],
    queryFn: async () => {
      const res = await api.get('/exercises', { params });
      return res.data;
    },
  });
}

export function useWorkoutTemplates(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['workout-templates', params],
    queryFn: async () => {
      const res = await api.get('/workout-templates', { params });
      return res.data;
    },
  });
}
