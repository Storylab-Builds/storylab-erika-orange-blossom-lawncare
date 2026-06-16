import { useMemo, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  Route,
  Download,
  FileText,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useDailyMetrics, useRevenueData, useCrewUtilization, useCustomers, useJobsSeries } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportReportPdf, exportReportCsv, type ReportSummary } from '@/lib/exportReport';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatsCard from '@/components/StatsCard';
import type { DailyMetrics } from '@/types';

type RangePreset = '30d' | 'month' | 'year' | 'decade' | 'custom';

const RANGE_OPTIONS = [
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'decade', label: 'Last decade' },
  { value: 'custom', label: 'Custom range' },
];

/** How many days of data to FETCH for each preset; we filter client-side after. */
function fetchDaysFor(preset: RangePreset): number {
  switch (preset) {
    case '30d': return 30;
    case 'month': return 31;
    case 'year': return 366;
    case 'decade': return 3653; // ~10 years
    case 'custom': return 3653; // fetch wide, filter to from/to
  }
}

/** Inclusive 'YYYY-MM-DD' bounds for a preset; '' means open-ended (no filter on that side). */
function computeRangeBounds(preset: RangePreset, from: string, to: string) {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  switch (preset) {
    case 'month': return { rangeFrom: iso(new Date(now.getFullYear(), now.getMonth(), 1)), rangeTo: iso(now) };
    case 'year': return { rangeFrom: iso(new Date(now.getFullYear(), 0, 1)), rangeTo: iso(now) };
    case 'decade': return { rangeFrom: iso(new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())), rangeTo: iso(now) };
    case 'custom': return { rangeFrom: from, rangeTo: to }; // may be '' → open-ended
    case '30d':
    default: return { rangeFrom: '', rangeTo: '' }; // trust the 30-day fetch window
  }
}

/** Filter date-bearing rows to an inclusive range; lexical compare is safe for zero-padded ISO dates. */
function filterByRange<T extends { date: string }>(rows: T[], from: string, to: string): T[] {
  return rows.filter((r) => (!from || r.date >= from) && (!to || r.date <= to));
}

/** Group a daily jobs series into weekly buckets for the bar chart. */
function buildWeeklyJobs(series: { date: string; completed: number; scheduled: number }[]) {
  const out: { week: string; completed: number; scheduled: number }[] = [];
  for (let i = 0; i < series.length; i += 7) {
    const wk = series.slice(i, i + 7);
    if (wk.length > 0) {
      out.push({
        week: formatDate(wk[0].date).replace(/, \d{4}$/, ''),
        completed: wk.reduce((s, d) => s + d.completed, 0),
        scheduled: wk.reduce((s, d) => s + d.scheduled, 0),
      });
    }
  }
  return out;
}

/** Aggregate filtered daily metrics into summary KPIs (divide-by-zero safe). */
function computeSummary(metrics: DailyMetrics[]): ReportSummary {
  const n = metrics.length || 1;
  return {
    totalRevenue: metrics.reduce((s, m) => s + m.revenue, 0),
    jobsScheduled: metrics.reduce((s, m) => s + m.jobsScheduled, 0),
    jobsCompleted: metrics.reduce((s, m) => s + m.jobsCompleted, 0),
    avgUtilization: Math.round(metrics.reduce((s, m) => s + m.crewUtilization, 0) / n),
    avgSatisfaction: metrics.reduce((s, m) => s + m.customerSatisfaction, 0) / n,
  };
}

/** Native date input styled to match Select/Input primitives, with dark-mode-aware picker. */
function DateField({ label, value, onChange, min, max }: {
  label: string; value: string; onChange: (v: string) => void; min?: string; max?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                   px-4 py-2.5 text-sm text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                   [color-scheme:light] dark:[color-scheme:dark]"
      />
    </div>
  );
}

export default function Reports() {
  // STATE (hooks)
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Plain derived value (not a hook) — drives the fetch window.
  const fetchDays = fetchDaysFor(preset);

  // QUERY HOOKS — all share the same fetchDays so the daily-metrics query is cached once.
  const { data: metrics, isLoading: metricsLoading } = useDailyMetrics(fetchDays);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(fetchDays);
  const { data: crewUtilData, isLoading: crewLoading } = useCrewUtilization();
  const { data: customers } = useCustomers();
  const { data: jobsSeries } = useJobsSeries(fetchDays);

  // MEMOS — every memo BEFORE any early return (Rules of Hooks).
  const { rangeFrom, rangeTo } = useMemo(
    () => computeRangeBounds(preset, fromDate, toDate),
    [preset, fromDate, toDate],
  );
  const filteredMetrics = useMemo(
    () => filterByRange(metrics ?? [], rangeFrom, rangeTo),
    [metrics, rangeFrom, rangeTo],
  );
  const filteredRevenue = useMemo(
    () => filterByRange(revenueData ?? [], rangeFrom, rangeTo),
    [revenueData, rangeFrom, rangeTo],
  );
  const filteredJobsSeries = useMemo(
    () => filterByRange(jobsSeries ?? [], rangeFrom, rangeTo),
    [jobsSeries, rangeFrom, rangeTo],
  );
  const revenueChartData = useMemo(
    () => filteredRevenue.map((d) => ({ day: formatDate(d.date).replace(/, \d{4}$/, ''), revenue: d.revenue })),
    [filteredRevenue],
  );
  const weeklyJobsData = useMemo(() => buildWeeklyJobs(filteredJobsSeries), [filteredJobsSeries]);
  const summary = useMemo<ReportSummary>(() => computeSummary(filteredMetrics), [filteredMetrics]);

  // EARLY RETURN — only AFTER all hooks.
  if (metricsLoading || revenueLoading) {
    return <LoadingSpinner fullPage label="Loading reports..." />;
  }

  // Plain consts / event handlers (not hooks) — safe after the early return.
  const rangeLabel = preset === 'custom' && (rangeFrom || rangeTo)
    ? `${rangeFrom ? formatDate(rangeFrom) : '…'} – ${rangeTo ? formatDate(rangeTo) : '…'}`
    : RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? 'Custom range';
  const hasData = filteredMetrics.length > 0;
  const avgDailyFiltered = hasData ? Math.round(summary.totalRevenue / filteredMetrics.length) : 0;
  const activeCustomerCount = (customers ?? []).filter((c) => c.status === 'active').length;

  const handlePdf = () => exportReportPdf({ rangeLabel, summary, rows: filteredMetrics });
  const handleCsv = () => exportReportCsv(filteredMetrics, `obs-report-${preset}-${Date.now()}.csv`);

  return (
    <div className="space-y-6">
      {/* Header: time-range control + exports */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reports</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">{rangeLabel}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Select
              label="Time range"
              options={RANGE_OPTIONS}
              value={preset}
              onChange={(v) => setPreset(v as RangePreset)}
            />
          </div>
          {preset === 'custom' && (
            <>
              <DateField label="From" value={fromDate} onChange={setFromDate} max={toDate || undefined} />
              <DateField label="To" value={toDate} onChange={setToDate} min={fromDate || undefined} />
            </>
          )}
          <Button variant="outline" size="md" icon={<FileText className="w-4 h-4" />} onClick={handlePdf} disabled={!hasData}>
            Export PDF
          </Button>
          <Button variant="outline" size="md" icon={<Download className="w-4 h-4" />} onClick={handleCsv} disabled={!hasData}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard
          title="Jobs Completed"
          value={summary.jobsCompleted}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatsCard
          title="Active Customers"
          value={activeCustomerCount}
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="Avg Utilization"
          value={`${summary.avgUtilization}%`}
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Revenue + Jobs Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{`Revenue — ${rangeLabel}`}</h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">Avg daily: {formatCurrency(avgDailyFiltered)}</p>
          <div role="img" aria-label={`Line chart of daily revenue for ${rangeLabel}. Average daily revenue ${formatCurrency(avgDailyFiltered)}, total ${formatCurrency(summary.totalRevenue)}.`}>
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
          <div role="img" aria-label={`Bar chart comparing scheduled versus completed jobs grouped by week for ${rangeLabel}.`}>
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Daily Performance</h3>
          <div className="space-y-2">
            {!hasData && (
              <p className="text-sm text-slate-400 dark:text-gray-500 py-4 text-center">No data for the selected range.</p>
            )}
            {filteredMetrics.slice(-7).map((m) => (
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
            {!hasData && (
              <p className="text-sm text-slate-400 dark:text-gray-500 py-4 text-center">No data for the selected range.</p>
            )}
            {filteredMetrics.slice(-7).map((m) => (
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
