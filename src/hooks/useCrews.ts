import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Crew, Employee } from '@/types';

const CREWS_KEY = ['crews'];

export function useCrews() {
  return useQuery<Crew[]>({
    queryKey: CREWS_KEY,
    queryFn: () => api.get<Crew[]>('/crews'),
    staleTime: 30 * 1000,
  });
}

export function useCreateCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Crew>) => api.post<Crew>('/crews', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}

export function useUpdateCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Crew> & { id: string }) =>
      api.patch<Crew>(`/crews/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}

export function useDeleteCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: boolean }>(`/crews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}

export function useAddCrewMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, ...member }: Partial<Employee> & { crewId: string }) =>
      api.post<Crew>(`/crews/${crewId}/members`, member),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}

export function useUpdateCrewMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      crewId,
      memberId,
      ...updates
    }: Partial<Employee> & { crewId: string; memberId: string }) =>
      api.patch<Crew>(`/crews/${crewId}/members/${memberId}`, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}

export function useRemoveCrewMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, memberId }: { crewId: string; memberId: string }) =>
      api.del<Crew>(`/crews/${crewId}/members/${memberId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: CREWS_KEY }),
  });
}
