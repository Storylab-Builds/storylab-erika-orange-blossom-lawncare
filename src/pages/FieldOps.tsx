import { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MapPin,
  Play,
  CheckCircle2,
  Coffee,
  Navigation,
  Phone,
  Clipboard,
  AlertCircle,
  Timer,
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

function getJobStatusStyle(status: Job['status']): { bg: string; border: string } {
  switch (status) {
    case 'completed': return { bg: 'bg-success/5', border: 'border-success/20' };
    case 'in-progress': return { bg: 'bg-primary/5', border: 'border-primary/20' };
    default: return { bg: 'bg-white', border: 'border-slate-100' };
  }
}

export default function FieldOps() {
  // Clock-in / break toggles are intentionally client-only operator-session UI
  // state for now: they represent the device operator's session, not a specific
  // employee record, so they are not persisted to the backend.
  const clockedIn = useAppStore((s) => s.clockedIn);
  const clockInTime = useAppStore((s) => s.clockInTime);
  const onBreak = useAppStore((s) => s.onBreak);
  const toggleClockIn = useAppStore((s) => s.toggleClockIn);
  const toggleBreak = useAppStore((s) => s.toggleBreak);

  // Job status changes persist via the API (jobs query invalidates/refetches).
  const updateJob = useUpdateJob();

  // Break timer: counts up in seconds while onBreak is true
  const [breakSeconds, setBreakSeconds] = useState(0);
  const breakIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (onBreak) {
      setBreakSeconds(0);
      breakIntervalRef.current = setInterval(() => {
        setBreakSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
        breakIntervalRef.current = null;
      }
      setBreakSeconds(0);
    }
    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [onBreak]);

  const breakMinutes = Math.floor(breakSeconds / 60);
  const breakSecs = breakSeconds % 60;
  const breakDisplay = `${String(breakMinutes).padStart(2, '0')}:${String(breakSecs).padStart(2, '0')}`;

  const { data: todayJobs, isLoading } = useTodayJobs();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading field operations..." />;
  }

  const jobs = todayJobs ?? [];
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const total = jobs.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Clock In/Out + Status */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">Field Operations</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {clockedIn && clockInTime
                ? `Clocked in ${getRelativeTime(clockInTime)}`
                : 'Not clocked in'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{completed}/{total} jobs</p>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big Clock Button */}
        <button
          onClick={toggleClockIn}
          aria-label={clockedIn ? 'Clock out' : 'Clock in'}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
            clockedIn
              ? 'bg-error/10 text-error border-2 border-error/20 hover:bg-error/20'
              : 'bg-success text-white hover:bg-success/90'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6" />
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </div>
        </button>

        {/* Break Button */}
        {clockedIn && (
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={toggleBreak}
              role="switch"
              aria-checked={onBreak}
              aria-label={onBreak ? 'End break' : 'Start break'}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                onBreak
                  ? 'bg-warning/10 text-warning border border-warning/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Coffee className="w-4 h-4" />
              {onBreak ? 'On Break' : 'Start Break'}
            </button>
            {onBreak && (
              <div className="flex items-center gap-2 text-sm text-warning" aria-live="polite">
                <Timer className="w-4 h-4" />
                <span className="font-medium font-mono">{breakDisplay}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* GPS Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/5 border border-success/20" role="status">
        <Navigation className="w-4 h-4 text-success" />
        <span className="text-sm text-success font-medium">GPS Active</span>
        <span className="text-xs text-slate-400 ml-auto">Location verified</span>
      </div>

      {/* Today's Jobs */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Today&apos;s Jobs</h3>
        <div className="space-y-3">
          {jobs.map((job) => {
            const st = getJobStatusStyle(job.status);
            const serviceLabel = SERVICE_TYPES[job.serviceType]?.label ?? job.serviceType;
            return (
              <div
                key={job.id}
                className={`rounded-xl border p-4 ${st.bg} ${st.border} transition-all`}
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{job.customerName}</h4>
                      {job.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      {job.status === 'in-progress' && (
                        <Badge variant="info" className="animate-pulse">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{serviceLabel}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p className="font-medium text-slate-600">{formatTime(job.startTime)} - {formatTime(job.endTime)}</p>
                    <p>{job.crewName}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{job.propertyAddress}</span>
                </div>

                {/* Notes */}
                {job.notes && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-400 mb-3 p-2 rounded-lg bg-slate-50">
                    <Clipboard className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{job.notes}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {job.status === 'scheduled' && (
                    <Button
                      className="flex-1"
                      icon={<Play className="w-4 h-4" />}
                      disabled={updateJob.isPending}
                      onClick={() => updateJob.mutate({ id: job.id, status: 'in-progress' })}
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
                      onClick={() => updateJob.mutate({ id: job.id, status: 'completed' })}
                    >
                      Complete Job
                    </Button>
                  )}
                  {job.status === 'completed' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 text-success text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </div>
                  )}
                  <button
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
                    aria-label="Call customer"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
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
      </div>
    </div>
  );
}
