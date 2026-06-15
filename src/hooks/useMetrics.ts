import { useQuery } from '@tanstack/react-query';
import { dailyMetrics, dashboardStats, todayJobs, crews } from '@/data/mockData';
import type { DailyMetrics, DashboardStats } from '@/types';

/**
 * Simulates fetching dashboard summary stats.
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return dashboardStats;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Simulates fetching daily metrics for charts/reports.
 * Optionally filter to last N days.
 */
async function fetchDailyMetrics(days: number): Promise<DailyMetrics[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return dailyMetrics.slice(-days);
}

export function useDailyMetrics(days: number = 30) {
  return useQuery<DailyMetrics[]>({
    queryKey: ['daily-metrics', days],
    queryFn: () => fetchDailyMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Derived revenue stats for charts.
 */
export function useRevenueData(days: number = 30) {
  const { data: metrics, ...rest } = useDailyMetrics(days);

  const revenueData = metrics?.map((m) => ({
    date: m.date,
    revenue: m.revenue,
  }));

  const totalRevenue = metrics?.reduce((sum, m) => sum + m.revenue, 0) ?? 0;
  const avgDailyRevenue = metrics ? Math.round(totalRevenue / metrics.length) : 0;

  return {
    ...rest,
    data: revenueData,
    totalRevenue,
    avgDailyRevenue,
  };
}

/**
 * Crew utilization data for reports.
 */
export function useCrewUtilization() {
  return useQuery({
    queryKey: ['crew-utilization'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return crews.map((crew) => ({
        crewId: crew.id,
        crewName: crew.name,
        todayJobs: crew.todayJobsCount,
        todayCompleted: crew.todayJobsCompleted,
        efficiency: crew.efficiency,
        status: crew.status,
        zone: crew.serviceZone,
      }));
    },
    staleTime: 30 * 1000,
  });
}
