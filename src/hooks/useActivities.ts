import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity } from '@/types';

export function useActivities(limit = 20) {
  return useQuery<Activity[]>({
    queryKey: ['activities', limit],
    queryFn: () => api.get<Activity[]>(`/activities?limit=${limit}`),
    staleTime: 30 * 1000,
  });
}
