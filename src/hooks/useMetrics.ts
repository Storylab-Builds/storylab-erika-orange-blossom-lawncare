import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DailyMetrics, DashboardStats } from '@/types';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
    staleTime: 60 * 1000,
  });
}

export function useDailyMetrics(days = 30) {
  return useQuery<DailyMetrics[]>({
    queryKey: ['daily-metrics', days],
    queryFn: () => api.get<DailyMetrics[]>(`/reports/daily-metrics?days=${days}`),
    staleTime: 5 * 60 * 1000,
  });
}

export interface JobsSeriesPoint {
  date: string;
  scheduled: number;
  completed: number;
}

export function useJobsSeries(days = 30) {
  return useQuery<JobsSeriesPoint[]>({
    queryKey: ['jobs-series', days],
    queryFn: () => api.get<JobsSeriesPoint[]>(`/reports/jobs-series?days=${days}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueData(days = 30) {
  const { data: metrics, ...rest } = useDailyMetrics(days);

  const revenueData = metrics?.map((m) => ({ date: m.date, revenue: m.revenue }));
  const totalRevenue = metrics?.reduce((sum, m) => sum + m.revenue, 0) ?? 0;
  const avgDailyRevenue = metrics && metrics.length > 0 ? Math.round(totalRevenue / metrics.length) : 0;

  return { ...rest, data: revenueData, totalRevenue, avgDailyRevenue };
}

export interface CrewUtilization {
  crewId: string;
  crewName: string;
  todayJobs: number;
  todayCompleted: number;
  efficiency: number;
  status: string;
  zone: string;
}

export function useCrewUtilization() {
  return useQuery<CrewUtilization[]>({
    queryKey: ['crew-utilization'],
    queryFn: () => api.get<CrewUtilization[]>('/reports/crew-utilization'),
    staleTime: 30 * 1000,
  });
}
