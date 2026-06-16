import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type SettingsMap = Record<string, unknown>;

export function useSettings() {
  return useQuery<SettingsMap>({
    queryKey: ['settings'],
    queryFn: () => api.get<SettingsMap>('/settings'),
    staleTime: 60 * 1000,
  });
}

export function useSaveSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      api.put(`/settings/${key}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
