import { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  Route,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useDailyMetrics, useRevenueData, useCrewUtilization, useCustomers } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/StatsCard';

export default function Reports() {
  const { data: metrics, isLoading: metricsLoading } = useDailyMetrics(30);
  const { totalRevenue, avgDailyRevenue, data: revenueData, isLoading: revenueLoading } = useRevenueData(30);
  const { data: crewUtilData, isLoading: crewLoading } = useCrewUtilization();
  const { data: customers } = useCustomers();

  // Chart data — these useMemo hooks MUST run before any early return (Rules of Hooks).
  const revenueChartData = useMemo(
    () =>
      (revenueData ?? []).map((d) => ({
        day: formatDate(d.date).replace(/, \d{4}$/, ''),
        revenue: d.revenue,
      })),
    [revenueData],
  );

  const weeklyJobsData = useMemo(() => {
    const out: { week: string; completed: number; scheduled: number }[] = [];
    if (metrics) {
      for (let i = 0; i < metrics.length; i += 7) {
        const weekSlice = metrics.slice(i, i + 7);
        if (weekSlice.length > 0) {
          out.push({
            week: formatDate(weekSlice[0].date).replace(/, \d{4}$/, ''),
            completed: weekSlice.reduce((s, m) => s + m.jobsCompleted, 0),
            scheduled: weekSlice.reduce((s, m) => s + m.jobsScheduled, 0),
          });
        }
      }
    }
    return out;
  }, [metrics]);

  if (metricsLoading || revenueLoading) {
    return <LoadingSpinner fullPage label="Loading reports..." />;
  }

  const totalJobsCompleted = metrics?.reduce((sum, m) => sum + m.jobsCompleted, 0) ?? 0;
  const avgEfficiency = metrics
    ? Math.round(metrics.reduce((sum, m) => sum + m.crewUtilization, 0) / metrics.length)
    : 0;
  const activeCustomerCount = (customers ?? []).filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard
          title="Jobs Completed"
          value={totalJobsCompleted}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatsCard
          title="Active Customers"
          value={activeCustomerCount}
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="Avg Utilization"
          value={`${avgEfficiency}%`}
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Revenue + Jobs Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Revenue - Last 30 Days</h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">Avg daily: {formatCurrency(avgDailyRevenue)}</p>
          <div role="img" aria-label={`Line chart of daily revenue over the last 30 days. Average daily revenue ${formatCurrency(avgDailyRevenue)}, total ${formatCurrency(totalRevenue)}.`}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Jobs Completed Chart */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Jobs by Week</h3>
          <div role="img" aria-label="Bar chart comparing scheduled versus completed jobs grouped by week over the last 30 days.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyJobsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
              />
              <Bar dataKey="scheduled" fill="#A5B4FC" radius={[6, 6, 0, 0]} name="Scheduled" isAnimationActive={false} />
              <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} name="Completed" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Crew Performance */}
      {!crewLoading && crewUtilData && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Crew Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-gray-700">
                  <th scope="col" className="text-left text-xs font-medium text-slate-500 dark:text-gray-400 pb-3">Crew</th>
                  <th scope="col" className="text-left text-xs font-medium text-slate-500 dark:text-gray-400 pb-3">Zone</th>
                  <th scope="col" className="text-left text-xs font-medium text-slate-500 dark:text-gray-400 pb-3">Jobs Today</th>
                  <th scope="col" className="text-left text-xs font-medium text-slate-500 dark:text-gray-400 pb-3">Efficiency</th>
                  <th scope="col" className="text-left text-xs font-medium text-slate-500 dark:text-gray-400 pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {crewUtilData.map((crew) => (
                  <tr key={crew.crewId} className="border-b border-slate-50 dark:border-gray-700/50 last:border-0">
                    <th scope="row" className="text-left py-3 text-sm font-semibold text-slate-900 dark:text-white">{crew.crewName}</th>
                    <td className="py-3 text-sm text-slate-600 dark:text-gray-400">{crew.zone}</td>
                    <td className="py-3 text-sm text-slate-700 dark:text-gray-300">{crew.todayCompleted}/{crew.todayJobs}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${crew.efficiency}%`,
                              backgroundColor: crew.efficiency >= 90 ? '#22C55E' : crew.efficiency >= 85 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-gray-300">{crew.efficiency}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium capitalize text-slate-500 dark:text-gray-400">{crew.status.replace('-', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer & Route Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Metrics Table */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Daily Performance (Last 7 Days)</h3>
          <div className="space-y-2">
            {(metrics ?? []).slice(-7).map((m) => (
              <div key={m.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(m.date)}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">{m.jobsCompleted}/{m.jobsScheduled} jobs</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(m.revenue)}</p>
                  <p className="text-xs text-success">{m.crewUtilization}% utilization</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Satisfaction */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Customer Satisfaction Trend</h3>
          </div>
          <div className="space-y-2">
            {(metrics ?? []).slice(-7).map((m) => (
              <div key={m.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-700">
                <p className="text-sm text-slate-700 dark:text-gray-300">{formatDate(m.date)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-warning">{m.customerSatisfaction}/5.0</span>
                  <div className="w-16 h-2 bg-slate-100 dark:bg-gray-600 rounded-full">
                    <div
                      className="h-full bg-warning rounded-full"
                      style={{ width: `${(m.customerSatisfaction / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
