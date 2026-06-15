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
import { useDailyMetrics, useRevenueData, useCrewUtilization } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { customers } from '@/data/mockData';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/StatsCard';

export default function Reports() {
  const { data: metrics, isLoading: metricsLoading } = useDailyMetrics(30);
  const { totalRevenue, avgDailyRevenue, data: revenueData, isLoading: revenueLoading } = useRevenueData(30);
  const { data: crewUtilData, isLoading: crewLoading } = useCrewUtilization();

  if (metricsLoading || revenueLoading) {
    return <LoadingSpinner fullPage label="Loading reports..." />;
  }

  const totalJobsCompleted = metrics?.reduce((sum, m) => sum + m.jobsCompleted, 0) ?? 0;
  const avgEfficiency = metrics
    ? Math.round(metrics.reduce((sum, m) => sum + m.crewUtilization, 0) / metrics.length)
    : 0;
  const activeCustomerCount = customers.filter((c) => c.status === 'active').length;

  // Revenue chart data
  const revenueChartData = (revenueData ?? []).map((d) => ({
    day: formatDate(d.date).replace(/, \d{4}$/, ''),
    revenue: d.revenue,
  }));

  // Weekly grouped jobs data
  const weeklyJobsData: { week: string; completed: number; scheduled: number }[] = [];
  if (metrics) {
    for (let i = 0; i < metrics.length; i += 7) {
      const weekSlice = metrics.slice(i, i + 7);
      if (weekSlice.length > 0) {
        weeklyJobsData.push({
          week: formatDate(weekSlice[0].date).replace(/, \d{4}$/, ''),
          completed: weekSlice.reduce((s, m) => s + m.jobsCompleted, 0),
          scheduled: weekSlice.reduce((s, m) => s + m.jobsScheduled, 0),
        });
      }
    }
  }

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
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Revenue - Last 30 Days</h3>
          <p className="text-xs text-slate-400 mb-2">Avg daily: {formatCurrency(avgDailyRevenue)}</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Jobs Completed Chart */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Jobs by Week</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyJobsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
              />
              <Bar dataKey="scheduled" fill="#A5B4FC" radius={[6, 6, 0, 0]} name="Scheduled" />
              <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Crew Performance */}
      {!crewLoading && crewUtilData && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Crew Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">Crew</th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">Zone</th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">Jobs Today</th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">Efficiency</th>
                  <th className="text-left text-xs font-medium text-slate-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {crewUtilData.map((crew) => (
                  <tr key={crew.crewId} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-sm font-semibold text-slate-900">{crew.crewName}</td>
                    <td className="py-3 text-sm text-slate-600">{crew.zone}</td>
                    <td className="py-3 text-sm text-slate-700">{crew.todayCompleted}/{crew.todayJobs}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${crew.efficiency}%`,
                              backgroundColor: crew.efficiency >= 90 ? '#22C55E' : crew.efficiency >= 85 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-700">{crew.efficiency}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium capitalize text-slate-500">{crew.status.replace('-', ' ')}</span>
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
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Daily Performance (Last 7 Days)</h3>
          <div className="space-y-2">
            {(metrics ?? []).slice(-7).map((m) => (
              <div key={m.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{formatDate(m.date)}</p>
                  <p className="text-xs text-slate-400">{m.jobsCompleted}/{m.jobsScheduled} jobs</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(m.revenue)}</p>
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
            <h3 className="text-sm font-semibold text-slate-900">Customer Satisfaction Trend</h3>
          </div>
          <div className="space-y-2">
            {(metrics ?? []).slice(-7).map((m) => (
              <div key={m.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-700">{formatDate(m.date)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-warning">{m.customerSatisfaction}/5.0</span>
                  <div className="w-16 h-2 bg-slate-100 rounded-full">
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
