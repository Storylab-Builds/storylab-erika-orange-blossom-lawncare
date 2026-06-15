import { useQuery } from '@tanstack/react-query';
import { allJobs } from '@/data/mockData';
import { useAppStore } from '@/store/appStore';
import type { Job } from '@/types';

interface UseJobsOptions {
  date?: string;
  crewIds?: string[];
  status?: Job['status'] | Job['status'][];
  customerId?: string;
}

/**
 * Simulates fetching jobs with filters.
 * Integrates with the Zustand store for completed-job overrides.
 */
async function fetchJobs(options: UseJobsOptions): Promise<Job[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...allJobs];

  if (options.date) {
    filtered = filtered.filter((j) => j.scheduledDate === options.date);
  }

  if (options.crewIds && options.crewIds.length > 0) {
    filtered = filtered.filter((j) => options.crewIds!.includes(j.crewId));
  }

  if (options.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    filtered = filtered.filter((j) => statuses.includes(j.status));
  }

  if (options.customerId) {
    filtered = filtered.filter((j) => j.customerId === options.customerId);
  }

  return filtered;
}

export function useJobs(options: UseJobsOptions = {}) {
  const completedJobIds = useAppStore((s) => s.completedJobIds);

  const query = useQuery<Job[]>({
    queryKey: ['jobs', options],
    queryFn: () => fetchJobs(options),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Merge store-completed jobs into the result
  const jobs: Job[] | undefined = query.data?.map((job) => {
    if (completedJobIds.includes(job.id) && job.status !== 'completed') {
      return {
        ...job,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
    }
    return job;
  });

  return {
    ...query,
    data: jobs,
  };
}

/**
 * Convenience hook for today's jobs.
 */
export function useTodayJobs() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const selectedCrews = useAppStore((s) => s.selectedCrews);

  return useJobs({
    date: selectedDate,
    crewIds: selectedCrews.length > 0 ? selectedCrews : undefined,
  });
}

/**
 * Hook for a single job by ID.
 */
export function useJob(jobId: string | null) {
  const completedJobIds = useAppStore((s) => s.completedJobIds);

  const query = useQuery<Job | null>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return allJobs.find((j) => j.id === jobId) ?? null;
    },
    enabled: !!jobId,
  });

  const job = query.data
    ? completedJobIds.includes(query.data.id) && query.data.status !== 'completed'
      ? { ...query.data, status: 'completed' as const, completedAt: new Date().toISOString() }
      : query.data
    : null;

  return { ...query, data: job };
}
