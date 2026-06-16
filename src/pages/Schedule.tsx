import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { useJobs, useWeather, useCrews } from '@/hooks';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Job } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import JobFormModal from '@/components/JobFormModal';

const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function getServiceColor(type: Job['serviceType']): string {
  return SERVICE_TYPES[type]?.color ?? '#6366F1';
}

export default function Schedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  // Track crews the user has explicitly hidden; everything is visible by default
  // (works even before live crew data has loaded).
  const [hiddenCrews, setHiddenCrews] = useState<Set<string>>(() => new Set());
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const isCrewVisible = (crewId: string) => !hiddenCrews.has(crewId);

  const toggleCrew = (crewId: string) => {
    setHiddenCrews((prev) => {
      const next = new Set(prev);
      if (next.has(crewId)) next.delete(crewId);
      else next.add(crewId);
      return next;
    });
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch all jobs (no date filter so we get the full week)
  const { data: allJobs, isLoading } = useJobs();
  const { data: weather } = useWeather();
  const crews = useCrews().data ?? [];

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading schedule..." />;
  }

  // Color legend
  const serviceColorEntries = Object.entries(SERVICE_TYPES).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekStart((prev) => subDays(prev, 7))}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-500 dark:text-gray-400"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <button
            onClick={() => setWeekStart((prev) => addDays(prev, 7))}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-500 dark:text-gray-400"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs">
            {serviceColorEntries.map(([type, conf]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: conf.color }} aria-hidden="true" />
                <span className="text-slate-500 dark:text-gray-400">{conf.label}</span>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" aria-hidden="true" />}
            onClick={() => setIsJobModalOpen(true)}
          >
            New Job
          </Button>
        </div>
      </div>

      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        defaultDate={format(weekStart, 'yyyy-MM-dd')}
      />

      <div className="flex gap-6">
        {/* Crew Filter Sidebar */}
        <div className="w-48 flex-shrink-0">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Crews</h3>
            </div>
            <div className="space-y-2">
              {crews.map((crew) => (
                <label key={crew.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCrewVisible(crew.id)}
                    onChange={() => toggleCrew(crew.id)}
                    aria-label={`Show ${crew.name}`}
                    className="w-4 h-4 rounded border-slate-300 dark:border-gray-600 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-slate-700 dark:text-gray-300">{crew.name}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {days.map((day, dayIdx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const forecastDay = weather?.forecast?.find((f) => f.date === dateStr);
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                const isHighImpact = forecastDay?.impact === 'moderate' || forecastDay?.impact === 'high';
                return (
                  <div
                    key={dayIdx}
                    className={`text-center p-2 rounded-xl ${isToday ? 'bg-primary text-white' : isHighImpact ? 'bg-warning/10' : 'bg-white dark:bg-gray-800'} border ${isToday ? 'border-primary' : 'border-slate-100 dark:border-gray-700'}`}
                  >
                    <p className={`text-xs font-medium ${isToday ? 'text-white/80' : 'text-slate-500 dark:text-gray-400'}`}>
                      {format(day, 'EEE')}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {format(day, 'd')}
                    </p>
                    {forecastDay && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className={`text-xs ${isToday ? 'text-white/80' : 'text-slate-400 dark:text-gray-500'}`}>
                          {forecastDay.high}&#176; {forecastDay.precipChance}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div role="img" aria-label="Weekly schedule grid showing jobs by day, crew, and hour">
              {/* Time header row */}
              <div className="flex items-center mb-2 pl-16">
                {timeSlots.map((t) => (
                  <div key={t} className="flex-1 text-xs text-slate-400 dark:text-gray-500 font-medium text-center">
                    {t > 12 ? `${t - 12}PM` : t === 12 ? '12PM' : `${t}AM`}
                  </div>
                ))}
              </div>

              {/* Day rows with crew sub-rows */}
              {days.map((day, dayIdx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayJobs = (allJobs ?? []).filter(
                  (j) => j.scheduledDate === dateStr && isCrewVisible(j.crewId),
                );

                // Group by crew
                const crewJobMap = new Map<string, Job[]>();
                dayJobs.forEach((j) => {
                  const existing = crewJobMap.get(j.crewId) ?? [];
                  existing.push(j);
                  crewJobMap.set(j.crewId, existing);
                });

                const crewEntries = Array.from(crewJobMap.entries());

                if (crewEntries.length === 0) {
                  return (
                    <div key={dayIdx} className="flex items-center mb-1 py-2 border-b border-slate-50 dark:border-gray-700">
                      <div className="w-16 flex-shrink-0 text-xs font-medium text-slate-400 dark:text-gray-500">{format(day, 'EEE')}</div>
                      <div className="flex-1 h-6 bg-slate-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-slate-300 dark:text-gray-500">{dayIdx === 6 ? 'Day Off' : 'No jobs'}</span>
                      </div>
                    </div>
                  );
                }

                return crewEntries.map(([crewId, crewJobs], crewIdx) => {
                  const crewInfo = crews.find((c) => c.id === crewId);
                  return (
                    <div key={`${dayIdx}-${crewId}`} className="flex items-center mb-1">
                      <div className="w-16 flex-shrink-0 text-[10px] text-slate-400 dark:text-gray-500">
                        {crewIdx === 0 && <span className="font-medium text-xs text-slate-500 dark:text-gray-400">{format(day, 'EEE')}</span>}
                        <br />
                        <span className="text-slate-300 dark:text-gray-500">{crewInfo?.name ?? crewId}</span>
                      </div>
                      <div className="flex-1 relative h-7 bg-slate-50 dark:bg-gray-700 rounded-lg">
                        {crewJobs.map((job) => {
                          const [startH, startM] = job.startTime.split(':').map(Number);
                          const [endH, endM] = job.endTime.split(':').map(Number);
                          const start = startH + startM / 60;
                          const end = endH + endM / 60;
                          const totalHours = timeSlots[timeSlots.length - 1] - timeSlots[0];
                          const left = ((start - timeSlots[0]) / totalHours) * 100;
                          const width = ((end - start) / totalHours) * 100;
                          return (
                            <div
                              key={job.id}
                              className="absolute top-0.5 bottom-0.5 rounded-md flex items-center px-1.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              style={{
                                left: `${Math.max(0, left)}%`,
                                width: `${Math.max(1, width)}%`,
                                backgroundColor: getServiceColor(job.serviceType),
                                opacity: job.status === 'completed' ? 0.6 : 1,
                              }}
                              title={`${SERVICE_TYPES[job.serviceType]?.label ?? job.serviceType} - ${job.customerName} (${job.propertyAddress})`}
                            >
                              <span className="text-[9px] text-white font-medium truncate">
                                {job.customerName.split(' ').pop()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
