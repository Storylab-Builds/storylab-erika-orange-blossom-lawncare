import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import type { Job } from '@/types';

interface UseJobsOptions {
  date?: string;
  crewIds?: string[];
  status?: Job['status'] | Job['status'][];
  customerId?: string;
}

/** Overlay optimistic client-side completions (FieldOps "Complete Job"). */
function mergeCompleted(jobs: Job[], completedIds: string[]): Job[] {
  if (completedIds.length === 0) return jobs;
  return jobs.map((j) =>
    completedIds.includes(j.id) && j.status !== 'completed'
      ? { ...j, status: 'completed' as const, completedAt: j.completedAt ?? new Date().toISOString() }
      : j,
  );
}

export function useJobs(options: UseJobsOptions = {}) {
  const completedJobIds = useAppStore((s) => s.completedJobIds);
  const query = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => api.get<Job[]>('/jobs'),
    staleTime: 30 * 1000,
  });

  let data = query.data;
  if (data) {
    if (options.date) data = data.filter((j) => j.scheduledDate === options.date);
    if (options.crewIds && options.crewIds.length > 0) {
      data = data.filter((j) => j.crewId && options.crewIds!.includes(j.crewId));
    }
    if (options.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      data = data.filter((j) => statuses.includes(j.status));
    }
    if (options.customerId) data = data.filter((j) => j.customerId === options.customerId);
    data = mergeCompleted(data, completedJobIds);
  }

  return { ...query, data };
}

export function useTodayJobs() {
  const completedJobIds = useAppStore((s) => s.completedJobIds);
  const query = useQuery<Job[]>({
    queryKey: ['jobs', 'today'],
    queryFn: () => api.get<Job[]>('/jobs/today'),
    staleTime: 30 * 1000,
  });
  return { ...query, data: query.data ? mergeCompleted(query.data, completedJobIds) : query.data };
}

export function useJob(jobId: string | null) {
  const completedJobIds = useAppStore((s) => s.completedJobIds);
  const query = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: () => api.get<Job>(`/jobs/${jobId}`),
    enabled: !!jobId,
  });
  const data = query.data ? mergeCompleted([query.data], completedJobIds)[0] : query.data;
  return { ...query, data };
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Job> & { id: string }) =>
      api.patch<Job>(`/jobs/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
