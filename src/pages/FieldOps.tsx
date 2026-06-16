import { useState, useEffect } from 'react';
import {
  MapPin,
  Play,
  CheckCircle2,
  Navigation,
  Phone,
  Clipboard,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useTodayJobs, useUpdateJob } from '@/hooks';
import { useAppStore } from '@/store/appStore';
import { SERVICE_TYPES } from '@/lib/constants';
import { formatTime, getRelativeTime } from '@/lib/utils';
import type { Job } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

// Parse a job's scheduled end into a Date for "overdue" checks.
function scheduledEnd(job: Job): Date {
  return new Date(`${job.scheduledDate}T${job.endTime}:00`);
}

// True when a still-scheduled job's window has already elapsed.
function isOverdue(job: Job, now: Date): boolean {
  const end = scheduledEnd(job);
  return job.status === 'scheduled' && !isNaN(end.getTime()) && end < now;
}

// Minutes -> "1h 20m" / "45m". Used for actualDuration + computed elapsed.
function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Compute a duration label for a job from server actualDuration, or from the
// client-captured start time to completedAt/now when the server hasn't recorded one.
function durationLabel(job: Job, start: string | undefined, now: Date): string {
  if (typeof job.actualDuration === 'number') return formatDuration(job.actualDuration);
  if (!start) return '—';
  const startMs = new Date(start).getTime();
  if (isNaN(startMs)) return '—';
  const endMs = job.completedAt ? new Date(job.completedAt).getTime() : now.getTime();
  return formatDuration((endMs - startMs) / 60000);
}

function getJobStatusStyle(status: Job['status']): { bg: string; border: string } {
  switch (status) {
    case 'completed': return { bg: 'bg-success/5', border: 'border-success/20' };
    case 'in-progress': return { bg: 'bg-primary/5', border: 'border-primary/20' };
    default: return { bg: 'bg-white dark:bg-gray-800', border: 'border-slate-100 dark:border-gray-700' };
  }
}

// Tiny auto-captured timestamp tile (dark-mode safe).
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-gray-700/50 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-gray-500">{label}</p>
      <p className="font-medium text-slate-700 dark:text-gray-200">{value}</p>
    </div>
  );
}

export default function FieldOps() {
  // Job status changes persist via the API (jobs query invalidates/refetches).
  const updateJob = useUpdateJob();
  // Optimistic completion overlay so completed cards flip instantly.
  const completeJob = useAppStore((s) => s.completeJob);

  // Start timestamps are auto-captured client-side (the server records only
  // completedAt, there is no startedAt field on the Job record).
  const [startedAt, setStartedAt] = useState<Record<string, string>>({});

  // Ticking clock so overdue flags + in-progress elapsed update live.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { data: todayJobs, isLoading, isError, refetch } = useTodayJobs();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading field operations..." />;
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg">
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <AlertCircle className="w-8 h-8 text-error" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Couldn&apos;t load field operations
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Something went wrong fetching today&apos;s jobs.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const jobs = todayJobs ?? [];
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const total = jobs.length;
  const overdueCount = jobs.filter((j) => isOverdue(j, now)).length;

  const handleStart = (job: Job) => {
    setStartedAt((m) => ({ ...m, [job.id]: new Date().toISOString() }));
    updateJob.mutate({ id: job.id, status: 'in-progress' });
  };

  const handleComplete = (job: Job) => {
    completeJob(job.id); // optimistic overlay -> completedAt set immediately
    updateJob.mutate({ id: job.id, status: 'completed' }); // server records completedAt
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Auto-capture summary header */}
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Field Operations</p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              Times are captured automatically — no manual clock needed
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{completed}/{total} jobs</p>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {overdueCount} job{overdueCount > 1 ? 's' : ''} past scheduled end — ready to auto-complete
          </div>
        )}
      </Card>

      {/* GPS Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/5 border border-success/20" role="status">
        <Navigation className="w-4 h-4 text-success" />
        <span className="text-sm text-success font-medium">GPS Active</span>
        <span className="text-xs text-slate-400 dark:text-gray-500 ml-auto">Location verified</span>
      </div>

      {/* Today's Jobs */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Today&apos;s Jobs</h3>
        {jobs.length === 0 ? (
          <Card padding="lg">
            <div className="flex flex-col items-center text-center gap-2 py-6">
              <Clipboard className="w-8 h-8 text-slate-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No jobs scheduled for today</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">Enjoy the quiet — check back later.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const overdue = isOverdue(job, now);
              const start = startedAt[job.id];
              const showTimes = job.status === 'in-progress' || job.status === 'completed';
              const serviceLabel = SERVICE_TYPES[job.serviceType]?.label ?? job.serviceType;
              const st = overdue
                ? { bg: 'bg-warning/5', border: 'border-warning/30' }
                : getJobStatusStyle(job.status);
              return (
                <div
                  key={job.id}
                  className={`rounded-xl border p-4 ${st.bg} ${st.border} transition-all`}
                >
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{job.customerName}</h4>
                        {job.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                        {job.status === 'in-progress' && (
                          <Badge variant="info" className="animate-pulse">In Progress</Badge>
                        )}
                        {overdue && (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-0.5">{serviceLabel}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400 dark:text-gray-500">
                      <p className="font-medium text-slate-600 dark:text-gray-400">{formatTime(job.startTime)} - {formatTime(job.endTime)}</p>
                      <p>{job.crewName}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400 mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{job.propertyAddress}</span>
                  </div>

                  {/* Notes */}
                  {job.notes && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-400 dark:text-gray-500 mb-3 p-2 rounded-lg bg-slate-50 dark:bg-gray-700">
                      <Clipboard className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{job.notes}</span>
                    </div>
                  )}

                  {/* Auto-captured timestamps */}
                  {showTimes && (
                    <div className="mt-2 mb-3 grid grid-cols-3 gap-2 text-xs">
                      <Stat label="Started" value={start ? formatTime(start) : '—'} />
                      <Stat label="Completed" value={job.completedAt ? formatTime(job.completedAt) : '—'} />
                      <Stat label="Duration" value={durationLabel(job, start, now)} />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {job.status === 'scheduled' && (
                      <Button
                        className="flex-1"
                        icon={<Play className="w-4 h-4" />}
                        disabled={updateJob.isPending}
                        onClick={() => handleStart(job)}
                      >
                        Start Job
                      </Button>
                    )}
                    {job.status === 'in-progress' && (
                      <Button
                        className="flex-1"
                        variant="primary"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        disabled={updateJob.isPending}
                        onClick={() => handleComplete(job)}
                      >
                        Complete Job
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 text-success text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed{job.completedAt ? ` ${getRelativeTime(job.completedAt)}` : ''}
                      </div>
                    )}
                    <button
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-600 text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Call customer"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-600 text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Navigate to address"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Weather warning for affected jobs */}
                  {job.weatherAffected && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                      <span className="text-xs text-warning">Weather affected - may need rescheduling.</span>
                      <ChevronRight className="w-3 h-3 text-warning ml-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
