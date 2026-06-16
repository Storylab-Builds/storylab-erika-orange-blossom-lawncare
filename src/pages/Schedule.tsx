import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isToday as dfIsToday } from 'date-fns';
import { useJobs } from '@/hooks';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Job } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import JobFormModal from '@/components/JobFormModal';
import JobDetailModal from '@/components/JobDetailModal';

// --- Grid geometry (module-level constants, no hooks) ---
const DAY_START = 6; // 6:00 AM (first row / gridline)
const DAY_END = 19; // 19:00 (7 PM) last gridline
const HOUR_COUNT = DAY_END - DAY_START; // 13 hour rows
const ROW_PX = 56; // pixel height of one hour row
const GRID_PX = HOUR_COUNT * ROW_PX; // total scrollable column height
const HOURS = Array.from({ length: HOUR_COUNT + 1 }, (_, i) => DAY_START + i); // 6..19

// --- Helpers (module-level, < 50 lines, no hooks) ---

/** Parse "HH:mm" into decimal hours; fall back to DAY_START on bad/blank input. */
function parseTime(t: string | undefined): number {
  if (!t) return DAY_START;
  const [h, m] = t.split(':').map(Number);
  return (Number.isFinite(h) ? h : DAY_START) + (Number.isFinite(m) ? m : 0) / 60;
}

/** Vertical placement of a job block in px, clamped to the visible window. */
function jobLayout(job: Job): { top: number; height: number } {
  const start = Math.max(parseTime(job.startTime), DAY_START);
  const end = Math.min(Math.max(parseTime(job.endTime), start + 0.25), DAY_END);
  const top = (start - DAY_START) * ROW_PX;
  const height = Math.max((end - start) * ROW_PX, 22); // min height keeps label readable
  return { top, height };
}

function hourLabel(h: number): string {
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

/** Status-based block colors with good light + dark contrast. */
function statusClasses(status: Job['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200';
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200';
    case 'cancelled':
      return 'bg-gray-100 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 line-through';
    case 'weather-delayed':
      return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200';
    case 'rescheduled':
      return 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200';
    case 'scheduled':
    default:
      return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100';
  }
}

function serviceColor(type: Job['serviceType']): string {
  return SERVICE_TYPES[type]?.color ?? '#6366F1';
}

function serviceLabel(type: Job['serviceType']): string {
  return SERVICE_TYPES[type]?.label ?? type;
}

interface DayColumnProps {
  day: Date;
  jobs: Job[];
  isToday: boolean;
  now: Date;
  onJobClick: (job: Job) => void;
  onEmptyClick: () => void;
}

/** A single weekday column: gridlines, clickable backdrop, now-line, job blocks. */
function DayColumn({ day, jobs, isToday, now, onJobClick, onEmptyClick }: DayColumnProps) {
  const cur = now.getHours() + now.getMinutes() / 60;
  const showNow = isToday && cur >= DAY_START && cur <= DAY_END;
  return (
    <div
      className={`relative border-l border-slate-200 dark:border-gray-700 ${
        isToday ? 'bg-primary/5 dark:bg-primary/10' : ''
      }`}
    >
      {/* Clickable empty backdrop -> new job for this day */}
      <button
        type="button"
        aria-label={`Add job on ${format(day, 'EEE MMM d')}`}
        onClick={onEmptyClick}
        className="absolute inset-0 w-full h-full focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary/40"
      />

      {/* Horizontal hour gridlines */}
      {HOURS.slice(1, -1).map((h, i) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-slate-100 dark:border-gray-700/60 pointer-events-none"
          style={{ top: (i + 1) * ROW_PX }}
        />
      ))}

      {/* "Now" indicator (today only, within window) */}
      {showNow && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ top: (cur - DAY_START) * ROW_PX }}
        >
          <div className="h-0.5 bg-red-500" />
          <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
        </div>
      )}

      {/* Job blocks */}
      {jobs.map((job) => {
        const { top, height } = jobLayout(job);
        return (
          <button
            key={job.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onJobClick(job);
            }}
            style={{ top, height, borderLeftColor: serviceColor(job.serviceType) }}
            className={`absolute left-1 right-1 z-10 rounded-md border border-l-4 px-1.5 py-0.5 text-left overflow-hidden shadow-sm hover:shadow-md hover:z-30 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/60 ${statusClasses(
              job.status,
            )}`}
            title={`${job.customerName} • ${serviceLabel(job.serviceType)} • ${job.startTime}–${job.endTime}`}
            aria-label={`${serviceLabel(job.serviceType)} for ${job.customerName} from ${job.startTime} to ${job.endTime}. View details.`}
          >
            <p className="text-[11px] font-semibold leading-tight truncate">{job.customerName}</p>
            <p className="text-[10px] leading-tight truncate opacity-80">
              {serviceLabel(job.serviceType)}
            </p>
            {height > 38 && (
              <p className="text-[10px] leading-tight truncate opacity-70">
                {job.startTime}–{job.endTime}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function Schedule() {
  // --- ALL HOOKS FIRST (Rules of Hooks) ---
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [now, setNow] = useState(() => new Date());

  const { data: allJobs, isLoading, isError, refetch } = useJobs();

  // All 7 day Dates derived purely from weekStart — always rendered, job-independent
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Bucket jobs by scheduledDate (yyyy-MM-dd) for O(1) per-column lookup
  const jobsByDate = useMemo(() => {
    const map = new Map<string, Job[]>();
    (allJobs ?? []).forEach((j) => {
      const arr = map.get(j.scheduledDate) ?? [];
      arr.push(j);
      map.set(j.scheduledDate, arr);
    });
    return map;
  }, [allJobs]);

  // "Now" indicator tick — update every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // --- EARLY RETURN (only AFTER all hooks) ---
  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading schedule..." />;
  }

  // --- Handlers (plain functions) ---
  const goPrev = () => setWeekStart((d) => subDays(d, 7));
  const goNext = () => setWeekStart((d) => addDays(d, 7));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const openNewJob = (date?: string) => {
    setFormDate(date);
    setIsJobModalOpen(true);
  };

  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(
    addDays(weekStart, 6),
    'MMM d, yyyy',
  )}`;
  const gridCols = '4rem repeat(7, 1fr)';

  return (
    <div className="space-y-6">
      {/* Header: week navigation + range + New Job */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous week"
            className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <Button size="sm" variant="outline" onClick={goToday}>
            Today
          </Button>
          <button
            onClick={goNext}
            aria-label="Next week"
            className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <h2 className="ml-2 text-lg font-semibold text-slate-900 dark:text-white">
            {weekLabel}
          </h2>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" aria-hidden="true" />}
          onClick={() => openNewJob(format(weekStart, 'yyyy-MM-dd'))}
        >
          New Job
        </Button>
      </div>

      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        defaultDate={formDate}
      />
      <JobDetailModal
        job={selectedJob}
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
      />

      {/* Calendar week grid */}
      <Card className="p-0 overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
            <AlertTriangle className="w-8 h-8 text-error" aria-hidden="true" />
            <p className="text-sm text-slate-600 dark:text-gray-300">
              Couldn&apos;t load the schedule.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              {/* Day header row: gutter spacer + 7 weekday headers */}
              <div className="grid" style={{ gridTemplateColumns: gridCols }}>
                <div className="border-b border-slate-200 dark:border-gray-700" />
                {days.map((day) => {
                  const today = dfIsToday(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`text-center py-2 border-b border-l border-slate-200 dark:border-gray-700 ${
                        today ? 'bg-primary/10 dark:bg-primary/20' : ''
                      }`}
                    >
                      <p
                        className={`text-xs font-medium ${
                          today ? 'text-primary' : 'text-slate-500 dark:text-gray-400'
                        }`}
                      >
                        {format(day, 'EEE')}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          today ? 'text-primary' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {format(day, 'd')}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Body: time gutter + 7 day columns */}
              <div
                className="grid relative"
                style={{ gridTemplateColumns: gridCols, height: GRID_PX }}
              >
                {/* Time gutter (vertical hour labels) */}
                <div className="relative border-r border-slate-200 dark:border-gray-700">
                  {HOURS.slice(0, -1).map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 pr-1 text-right text-[10px] text-slate-400 dark:text-gray-500"
                      style={{ top: i * ROW_PX - 6 }}
                    >
                      {hourLabel(h)}
                    </div>
                  ))}
                </div>

                {/* 7 day columns — always rendered from `days` */}
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  return (
                    <DayColumn
                      key={dateStr}
                      day={day}
                      jobs={jobsByDate.get(dateStr) ?? []}
                      isToday={dfIsToday(day)}
                      now={now}
                      onJobClick={setSelectedJob}
                      onEmptyClick={() => openNewJob(dateStr)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
