import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  CloudRain,
  DollarSign,
  Plus,
  Calendar,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDashboardStats, useDailyMetrics } from '@/hooks';
import { useTodayJobs, useWeather, useActivities, useCrews } from '@/hooks';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { DashboardStats, Activity } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';

function getWeatherImpactLabel(impact: DashboardStats['weatherImpact']): string {
  switch (impact) {
    case 'none': return 'No impact';
    case 'low': return 'Low impact';
    case 'moderate': return 'Moderate';
    case 'high': return 'High impact';
    default: return '';
  }
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'job-completed': return { Icon: CheckCircle2, color: 'text-success' };
    case 'message-sent': return { Icon: MessageSquare, color: 'text-primary' };
    case 'weather-alert': return { Icon: AlertTriangle, color: 'text-warning' };
    case 'payment-received': return { Icon: TrendingUp, color: 'text-primary' };
    case 'customer-added': return { Icon: Users, color: 'text-primary' };
    case 'reschedule': return { Icon: Calendar, color: 'text-warning' };
    case 'crew-clockin': return { Icon: Users, color: 'text-success' };
    default: return { Icon: CheckCircle2, color: 'text-slate-400' };
  }
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: todayJobs, isLoading: jobsLoading, isError: jobsError } = useTodayJobs();
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { data: metrics } = useDailyMetrics(7);
  const { data: activities, isError: activitiesError } = useActivities(8);
  const { data: crews } = useCrews();

  // Time slots for the schedule timeline (stable, hoisted before any early return)
  const timeSlots = useMemo(() => [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], []);

  // Build schedule timeline from real today jobs, grouped by crew
  type JobItem = NonNullable<typeof todayJobs>[number];
  const crewGroups = useMemo(() => {
    const groups = new Map<string, JobItem[]>();
    (todayJobs ?? []).forEach((job) => {
      const existing = groups.get(job.crewName) ?? [];
      existing.push(job);
      groups.set(job.crewName, existing);
    });
    return groups;
  }, [todayJobs]);

  // Weekly jobs chart from metrics
  const weeklyJobsChart = useMemo(
    () =>
      (metrics ?? []).map((m) => ({
        name: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
        jobs: m.jobsCompleted,
      })),
    [metrics]
  );

  // Recent activities (last 8) from the API
  const recentActivities = activities ?? [];

  if (statsLoading || jobsLoading) {
    return <LoadingSpinner fullPage label="Loading dashboard..." />;
  }

  const hasStatsError = statsError || jobsError;

  const overviewCards = [
    { label: 'Jobs Scheduled', value: String(stats?.todayJobs ?? 0), change: `${stats?.todayCompleted ?? 0} completed`, icon: CalendarCheck, color: 'bg-primary' },
    { label: 'Crews Active', value: `${stats?.activeCrews ?? 0}/${stats?.totalCrews ?? 0}`, change: `${(crews ?? []).filter(c => c.status === 'break').length} on break`, icon: Users, color: 'bg-success' },
    { label: 'Weather Impact', value: getWeatherImpactLabel(stats?.weatherImpact ?? 'none'), change: `${stats?.pendingNotifications ?? 0} pending alerts`, icon: CloudRain, color: 'bg-warning' },
    { label: 'Weekly Revenue', value: formatCurrency(stats?.weeklyRevenue ?? 0), change: `+${stats?.weeklyRevenueChange ?? 0}% vs last week`, icon: DollarSign, color: 'bg-primary-dark' },
  ];

  // Weather forecast
  const forecast = weather?.forecast?.slice(0, 7) ?? [];

  return (
    <div className="space-y-6">
      {hasStatsError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3 text-sm text-error">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load some dashboard data. Showing what we have.</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">{card.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/customers"
              className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-primary font-medium text-sm"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> New Customer
            </Link>
            <Link
              to="/schedule"
              className="flex items-center gap-3 p-3 rounded-xl bg-success/5 hover:bg-success/10 transition-colors text-success font-medium text-sm"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> New Job
            </Link>
            <Link
              to="/schedule"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors text-slate-700 dark:text-gray-300 font-medium text-sm"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" /> View Full Schedule
            </Link>
          </div>
        </Card>

        {/* Weather Widget */}
        <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Weather Forecast</h3>
            <Link to="/weather" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Details <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
          {weatherLoading ? (
            <LoadingSpinner label="Loading weather..." />
          ) : weather ? (
            <>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-gray-700">
                <CloudRain className="w-12 h-12 text-warning" aria-hidden="true" />
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{weather.current.temp}&#176;F</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 capitalize">{weather.current.condition}, NE Ohio - Humidity {weather.current.humidity}%</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {forecast.map((day, idx) => {
                  const isRisk = day.impact === 'moderate' || day.impact === 'high';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center p-2 rounded-xl ${isRisk ? 'bg-warning/10' : 'bg-slate-50 dark:bg-gray-700'}`}
                    >
                      <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{day.high}&#176;</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">{day.precipChance}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </Card>
      </div>

      {/* Today's Schedule Timeline */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Today&apos;s Schedule</h3>
          <Link to="/schedule" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            Full Schedule <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-x-auto" role="img" aria-label="Today's crew schedule timeline showing job assignments by hour">
          <div className="min-w-[700px]">
            {/* Time header */}
            <div className="flex items-center mb-2">
              <div className="w-24 flex-shrink-0" />
              <div className="flex-1 flex">
                {timeSlots.map((t) => (
                  <div key={t} className="flex-1 text-xs text-slate-400 dark:text-gray-500 font-medium">
                    {t > 12 ? `${t - 12}PM` : t === 12 ? '12PM' : `${t}AM`}
                  </div>
                ))}
              </div>
            </div>
            {/* Crew rows */}
            {Array.from(crewGroups.entries()).map(([crewName, jobs]) => (
              <div key={crewName} className="flex items-center mb-2">
                <div className="w-24 flex-shrink-0 text-xs font-semibold text-slate-600 dark:text-gray-400">{crewName}</div>
                <div className="flex-1 relative h-8 bg-slate-50 dark:bg-gray-700 rounded-lg">
                  {jobs.map((job) => {
                    const [startH, startM] = job.startTime.split(':').map(Number);
                    const [endH, endM] = job.endTime.split(':').map(Number);
                    const start = startH + startM / 60;
                    const end = endH + endM / 60;
                    const totalHours = timeSlots[timeSlots.length - 1] - timeSlots[0];
                    const left = ((start - timeSlots[0]) / totalHours) * 100;
                    const width = ((end - start) / totalHours) * 100;
                    const color = job.status === 'completed' ? '#22C55E' : job.status === 'in-progress' ? '#F59E0B' : '#6366F1';
                    return (
                      <div
                        key={job.id}
                        className="absolute top-1 bottom-1 rounded-md flex items-center px-2 overflow-hidden"
                        style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%`, backgroundColor: color }}
                        title={`${job.serviceType} - ${job.customerName}`}
                      >
                        <span className="text-[10px] text-white font-medium truncate">{job.customerName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Feed + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3" aria-live="polite">
            {activitiesError ? (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Couldn&apos;t load recent activity.</span>
              </div>
            ) : recentActivities.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 py-6 text-center">No recent activity yet.</p>
            ) : (
              recentActivities.map((item) => {
                const { Icon, color } = getActivityIcon(item.type);
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-gray-300">{item.description}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{getRelativeTime(item.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Weekly Jobs Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Jobs This Week</h3>
          <div role="img" aria-label="Bar chart of jobs completed per day over the last 7 days">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyJobsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
              />
              <Bar dataKey="jobs" fill="#6366F1" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
